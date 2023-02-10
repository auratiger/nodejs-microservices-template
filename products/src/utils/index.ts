import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import amqplib from 'amqplib';
import { APP_SECRET, EXCHANGE_NAME, MSG_QUEUE_URL } from '../config/index.js';
import logger from './logger.js';

//Utility functions
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string,
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

//Raise Events
export const PublishCustomerEvent = async (payload) => {
  axios.post('http://customer:8001/app-events/', {
    payload,
  });

  //     axios.post(`${BASE_URL}/customer/app-events/`,{
  //         payload
  //     });
};

export const PublishShoppingEvent = async (payload) => {
  // axios.post('http://gateway:8000/shopping/app-events/',{
  //         payload
  // });

  axios.post(`http://shopping:8003/app-events/`, {
    payload,
  });
};

//Message Broker

export const CreateChannel = async () => {
  const connection = await amqplib.connect(MSG_QUEUE_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(EXCHANGE_NAME, 'direct', { durable: true });
  return channel;
};

export const PublishMessage = (channel, service, msg) => {
  channel.publish(EXCHANGE_NAME, service, Buffer.from(msg));
  console.log('Sent: ', msg);
};
