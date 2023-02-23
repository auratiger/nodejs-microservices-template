import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { APP_SECRET } from '../config/index.js';
import logger from './logger.js';

//Utility functions
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (enteredPassword: string, savedPassword: string, salt: string) => {
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
