import dotenv from 'dotenv';

// NOTE: NODE_ENV should be either 'prod' or 'dev'
const configFile = `./.env.${process.env.NODE_ENV}`;
dotenv.config({ path: configFile });

export const PORT: number = parseInt(process.env.PORT as string);
export const DB_URL = process.env.MONGODB_URI as string;
export const APP_SECRET = process.env.APP_SECRET as string;
export const EXCHANGE_NAME = process.env.EXCHANGE_NAME as string;
export const HOSTNAME = process.env.HOSTNAME as string;
export const CUSTOMER_SERVICE = 'customer_service';
export const SHOPPING_SERVICE = 'shopping_service';

export const RABBITMQ_HOSTNAME = process.env.RABBITMQ_HOSTNAME as string;
export const RABBITMQ_USERNAME = process.env.RABBITMQ_USERNAME as string;
export const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD as string;
export const RABBITMQ_PORT: number = parseInt(process.env.RABBITMQ_PORT as string);
export const RABBITMQ_TIMEOUT: number = parseInt(process.env.RABBITMQ_TIMEOUT as string);
