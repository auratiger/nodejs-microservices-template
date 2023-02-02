import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import amqplib from 'amqplib';

import {
  APP_SECRET,
  EXCHANGE_NAME,
  CUSTOMER_SERVICE,
  MSG_QUEUE_URL,
} from '../config';
import logger from './logger';

//Utility functions
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt,
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: '30d' });
  } catch (error) {
    logger.info(error);
    return error;
  }
};

export const ValidateSignature = async (req) => {
  try {
    const signature = req.get('Authorization');
    logger.info(signature);
    const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    logger.info(error);
    return false;
  }
};

export const FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error('Data Not found!');
  }
};

//Message Broker
export const CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MSG_QUEUE_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(EXCHANGE_NAME, 'direct', { durable: true });
    return channel;
  } catch (err) {
    throw err;
  }
};

export const PublishMessage = (channel, service, msg) => {
  channel.publish(EXCHANGE_NAME, service, Buffer.from(msg));
  logger.info('Sent: ', msg);
};

export const SubscribeMessage = async (channel, service) => {
  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
  const q = await channel.assertQueue('', { exclusive: true });
  logger.info(` Waiting for messages in queue: ${q.queue}`);

  channel.bindQueue(q.queue, EXCHANGE_NAME, CUSTOMER_SERVICE);

  channel.consume(
    q.queue,
    (msg) => {
      if (msg.content) {
        logger.info('the message is:', msg.content.toString());
        service.SubscribeEvents(msg.content.toString());
      }
      logger.info('[X] received');
    },
    {
      noAck: true,
    },
  );
};
