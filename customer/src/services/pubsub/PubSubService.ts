import amqplib from 'amqplib';
import { EXCHANGE_NAME, CUSTOMER_SERVICE, HOSTNAME } from '../../config';
import { Service } from 'typedi';

@Service()
export default class PubSubService {
  private amqpConn: any = null;
  private subChannel: any = null;
  private pubChannel: any = null;
  private subList: Map<string, () => void> = new Map();
  private offlineSubReq: any = null;
  private subQueue: any = null;
  private offlinePublishReq: any = null;

  createConnection() {
    amqplib.connect(
      `amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOSTNAME}:${process.env.RABBITMQ_PORT}?heartbeat=60`,
      (err: any, conn: any) => {
        if (err) {
          console.error('[AMQP] connection warning: ', err.message);
          setTimeout(() => {
            this.createConnection();
          }, parseInt(process.env.RABBITMQ_TIMEOUT) || 3000);
          return;
        }

        conn.on('error', (err: any) => {
          if (err.message !== 'Connection closing') {
            console.error('[AMQP] conn error', err.message);
          }
        });

        conn.on('close', () => {
          console.error('[AMQP] reconnecting');
          return setTimeout(this.createConnection, 1000);
        });

        console.info('[AMQP] connected');
        this.amqpConn = conn;
        this.createSubscribeChannel(conn);
      },
    );
  }

  createSubscribeChannel(conn: any) {
    conn.createChannel((err: any, ch: any) => {
      if (err) {
        console.error('[AMQP] sub channel error', err);
        return;
      }

      if (!ch) {
        console.error('[AMQP] sub channel is undefined.');
        return;
      }

      ch.on('error', (err: any) => {
        console.error('[AMQP] sub channel error', err);
        this.reConnect();
      });

      ch.on('close', () => {
        console.info('[AMQP] sub channel closed');
        this.reConnect();
      });

      ch.assertQueue(EXCHANGE_NAME, 'direct', { durable: true });
      ch.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

      this.subChannel = ch;
    });
  }

  consumeMessages() {
    console.debug('Pubsub>>consumeMessages registered');
    this.subChannel.consume(
      this.subQueue,
      (msg: any) => {
        // eslint-disable-line max-statements, complexity
        if (!msg?.content) {
          return;
        }
        console.log('the message is:', msg.content.toString());
        // CustomerService.SubscribeEvents(msg.content.toString());
      },
      { noAck: true },
    );
  }

  createPublishChannel() {
    this.amqpConn.createConfirmChannel((err: any, ch: any) => {
      if (err) {
        console.error('[AMQP] pub channel error', err.message);
        return;
      }

      if (!ch) {
        console.error('[AMQP] pub channel is undefined.');
        return;
      }

      ch.on('error', (err: any) => {
        console.error('[AMQP] pub channel error', err.message);
        this.reConnect();
      });

      ch.on('close', () => {
        console.debug('[AMQP] pub channel closed');
        this.reConnect();
      });

      this.pubChannel = ch;
      this.offlinePublishReq.forEach((element: any) => {
        this.publishMessage(element.topic, element.data, element.options);
      });

      this.offlinePublishReq = [];
    });
  }

  /**
   * Cleanup channels and close connection.
   */
  close() {
    try {
      if (this.amqpConn) this.amqpConn.removeAllListeners();
      if (this.subChannel) this.subChannel.removeAllListeners();
      if (this.pubChannel) this.pubChannel.removeAllListeners();
      if (this.amqpConn) this.amqpConn.close();
      console.info('Closed connection.');
    } catch (ex) {
      console.error(
        'PubSub>>close. Error: ',
        ex.message,
        '. Stack: ',
        ex.stack,
      );
    }
  }

  /**
   * Reconnect after connection is closed.
   */
  reConnect() {
    this.close();
    this.createConnection();
    console.info('Re connected after channels/connection close.');
  }

  publishMessage(service: string, message: string, options?: any) {
    try {
      const msg = Buffer.from(message);
      this.pubChannel.publish(
        EXCHANGE_NAME,
        service,
        msg,
        { appId: HOSTNAME, type: 'json', ...options },
        (err: any, ok: any) => {
          if (err) {
            console.error('[AMQP] publish: ', err);
          }
        },
      );
    } catch (e) {
      console.error('[AMQP] publish error: ', e.message);
    }
  }

  addToOfflineQueue(queue: any, service: string, data: any, options?: any) {
    const existingReq = queue.find((e: any) => {
      return e.service === service;
    });
    if (!existingReq) {
      queue.push({ service, data, options });
    }
  }

  subscribe(service: string, handler: () => void) {
    try {
      console.debug(`Pubsub>>subscribe. Service: ${service}`);
      if (!this.subList.has(service)) {
        console.debug(`Pubsub>>subscribe Added service:${service}`);
        this.subList.set(service, handler);
      }

      this.addToOfflineQueue(this.offlineSubReq, service, handler);
      if (this.subChannel && this.subQueue) {
        this.subChannel.bindQueue(
          this.subQueue,
          EXCHANGE_NAME,
          CUSTOMER_SERVICE,
        );
        // NOTE: this.subChannel.bindQueue(this.subQueue, EXCHANGE_NAME, service);
        console.debug(`[*] Waiting for messages on service:${service}`);
        // } else {
        //   this.addToOfflineQueue(this.offlineSubReq, service, handler);
      }

      // eventEmitter.emit(INTERNAL_EVENTS_CHANNELS.SUBSCRIBE_TO_TOPIC, { service });
    } catch (ex) {
      console.error(
        `PubSub>>subscribe: service:${service}. Error:${ex.message}. Stack:${ex.stack}`,
      );
    }
  }

  publish(service: string, message: string, options?: any) {
    console.info(`Pubsub>>publish: service: ${service}. message: `, message);
    if (this.pubChannel) {
      this.publishMessage(service, message, options);
    } else {
      this.addToOfflineQueue(this.offlinePublishReq, service, message, options);
    }
  }

  unsubscribe(service: string) {
    try {
      if (this.subChannel && this.subQueue) {
        this.subChannel.unbindQueue(this.subQueue, EXCHANGE_NAME, service);
        console.debug(`[*] unsubscribed from service:${service}`);
      }
    } catch (ex) {
      console.error(
        `PubSub>>unsubscribe: service:${service}. Error:${ex.message}. Stack:${ex.stack}`,
      );
    }
  }
}
