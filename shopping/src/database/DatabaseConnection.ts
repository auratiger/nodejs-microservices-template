import mongoose from 'mongoose';
import { DB_URL } from '../config/index.js';
import logger from '../utils/logger.js';

export default async () => {
  try {
    logger.info('[DB] Atempting connection to mongodb');
    await mongoose.connect(DB_URL);
    logger.info('[DB] Connected');
  } catch (error) {
    logger.error('[DB] Error ============ ON DB Connection');
    logger.error(error);
  }
};
