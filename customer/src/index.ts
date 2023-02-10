import 'reflect-metadata';
import express from 'express';

import { Container } from 'typedi';
import { PORT } from './config/index.js';
import logger from './utils/logger.js';
import expressApp from './express-app.js';
import DatabaseConnection from './database/DatabaseConnection.js';
import PubSubService from './services/pubsub/PubSubService.js';

const startServer = async () => {
  const app = express();

  const pubSubService = Container.get(PubSubService);
  await pubSubService.createConnection();

  await DatabaseConnection();

  await expressApp(app);

  app
    .listen(PORT, () => {
      logger.info(`listening to port ${PORT}`);
    })
    .on('error', (err) => {
      logger.error(err);
      process.exit();
    })
    .on('close', () => {
      pubSubService.close();
    });
};

startServer();
