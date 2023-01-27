const dotEnv = require("dotenv");

// NOTE: NODE_ENV should be either 'prod' or 'dev'
const configFile = `./.env.${process.env.NODE_ENV}`;
dotEnv.config({ path: configFile });

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  BASE_URL: process.env.BASE_URL,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  CUSTOMER_SERVICE: "customer_service",
  SHOPPING_SERVICE: "shopping_service",
};
