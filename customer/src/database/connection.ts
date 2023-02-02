import mongoose from 'mongoose';
import { DB_URL } from '../config';
import logger from '../utils/logger';

export default async () => {
  try {
    await mongoose.connect(DB_URL);
    logger.info('Db Connected');
  } catch (error) {
    logger.error('Error ============ ON DB Connection');
    logger.error(error);
  }
};
