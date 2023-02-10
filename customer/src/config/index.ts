import dotenv from 'dotenv';

// NOTE: NODE_ENV should be either 'prod' or 'dev'
const configFile = `./.env.${process.env.NODE_ENV}`;
dotenv.config({ path: configFile });

export const PORT = process.env.PORT;
export const DB_URL = process.env.MONGODB_URI;
export const APP_SECRET = process.env.APP_SECRET;
export const EXCHANGE_NAME = process.env.EXCHANGE_NAME;
export const MSG_QUEUE_URL = process.env.MSG_QUEUE_URL;
export const HOSTNAME = process.env.HOSTNAME;
export const CUSTOMER_SERVICE = 'customer_service';
export const SHOPPING_SERVICE = 'shopping_service';
