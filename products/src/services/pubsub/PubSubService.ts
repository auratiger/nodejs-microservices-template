import amqplib, { Connection, ConfirmChannel, Channel, Message } from 'amqplib';
import {
  EXCHANGE_NAME,
  CUSTOMER_SERVICE,
  HOSTNAME,
  RABBITMQ_USERNAME,
  RABBITMQ_PASSWORD,
  RABBITMQ_HOSTNAME,
  RABBITMQ_PORT,
  RABBITMQ_TIMEOUT,
} from '../../config/index.js';
import { Service } from 'typedi';
import logger from '../../utils/logger.js';

@Service()
export default class PubSubService {
  private amqpConn: Connection | null = null;
  private subChannel: Channel | null = null;
  private pubChannel: ConfirmChannel | null = null;
  private subList: Map<string, () => void> = new Map();
  private offlineSubReq: any = null;
  private subQueue: any = null;
  private offlinePublishReq: any = null;

  async createConnection() {
    try {
      logger.info('[AMQP] connecting to rabbitmq');
      const conn = await amqplib.connect(
        `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOSTNAME}:${RABBITMQ_PORT}?heartbeat=60`,
      );
      logger.info('[AMQP] connected');

      this.amqpConn = conn;
    } catch (err: any) {
      if (err) {
        logger.error('[AMQP] connection warning: ', err.message);
        setTimeout(() => {
          this.createConnection();
        }, RABBITMQ_TIMEOUT || 3000);
        return;
      }
    }

    this.amqpConn.on('error', (err: Error) => {
      if (err.message !== 'Connection closing') {
        logger.error('[AMQP] conn error', err.message);
      }
    });

    this.amqpConn.on('close', () => {
      logger.error('[AMQP] reconnecting');
      return setTimeout(this.createConnection, 1000);
    });
  }

  createSubscribeChannel() {
    this.amqpConn.createChannel((err: Error, ch: Channel) => {
      if (err) {
        logger.error('[AMQP] sub channel error', err);
        return;
      }

      if (!ch) {
        logger.error('[AMQP] sub channel is undefined.');
        return;
      }

      ch.on('error', (err: Error) => {
        logger.error('[AMQP] sub channel error', err);
        this.reConnect();
      });

      ch.on('close', () => {
        logger.info('[AMQP] sub channel closed');
        this.reConnect();
      });

      ch.assertQueue(EXCHANGE_NAME, 'direct', { durable: true });
      ch.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

      this.subChannel = ch;
    });
  }

  consumeMessages() {
    logger.debug('Pubsub>>consumeMessages registered');
    this.subChannel.consume(
      this.subQueue,
      (msg: Message) => {
        // eslint-disable-line max-statements, complexity
        if (!msg?.content) {
          return;
        }
        logger.info('the message is:', msg.content.toString());
        // CustomerService.SubscribeEvents(msg.content.toString());
      },
      { noAck: true },
    );
  }

  createPublishChannel() {
    this.amqpConn.createConfirmChannel((err: Error, ch: Channel) => {
      if (err) {
        logger.error('[AMQP] pub channel error', err.message);
        return;
      }

      if (!ch) {
        logger.error('[AMQP] pub channel is undefined.');
        return;
      }

      ch.on('error', (err: Error) => {
        logger.error('[AMQP] pub channel error', err.message);
        this.reConnect();
      });

      ch.on('close', () => {
        logger.debug('[AMQP] pub channel closed');
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
      logger.info('Closed connection.');
    } catch (err: any) {
      logger.error('PubSub>>close. Error: ', err.message, '. Stack: ', err.stack);
    }
  }

  /**
   * Reconnect after connection is closed.
   */
  reConnect() {
    this.close();
    this.createConnection();
    logger.info('Re connected after channels/connection close.');
  }

  publishMessage(service: string, message: string, options?: any) {
    try {
      const msg = Buffer.from(message);
      this.pubChannel.publish(
        EXCHANGE_NAME,
        service,
        msg,
        { appId: HOSTNAME, type: 'json', ...options },
        (err: Error, ok: any) => {
          if (err) {
            logger.error('[AMQP] publish: ', err);
          }
        },
      );
    } catch (err: any) {
      logger.error('[AMQP] publish error: ', err.message);
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
      logger.debug(`Pubsub>>subscribe. Service: ${service}`);
      if (!this.subList.has(service)) {
        logger.debug(`Pubsub>>subscribe Added service:${service}`);
        this.subList.set(service, handler);
      }

      this.addToOfflineQueue(this.offlineSubReq, service, handler);
      if (this.subChannel && this.subQueue) {
        this.subChannel.bindQueue(this.subQueue, EXCHANGE_NAME, CUSTOMER_SERVICE);
        // NOTE: this.subChannel.bindQueue(this.subQueue, EXCHANGE_NAME, service);
        logger.debug(`[*] Waiting for messages on service:${service}`);
        // } else {
        //   this.addToOfflineQueue(this.offlineSubReq, service, handler);
      }

      // eventEmitter.emit(INTERNAL_EVENTS_CHANNELS.SUBSCRIBE_TO_TOPIC, { service });
    } catch (err: any) {
      logger.error(`PubSub>>subscribe: service:${service}. Error:${err.message}. Stack:${err.stack}`);
    }
  }

  publish(service: string, message: string, options?: any) {
    logger.info(`Pubsub>>publish: service: ${service}. message: `, message);
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
        logger.debug(`[*] unsubscribed from service:${service}`);
      }
    } catch (err: any) {
      logger.error(`PubSub>>unsubscribe: service:${service}. Error:${err.message}. Stack:${err.stack}`);
    }
  }
}
