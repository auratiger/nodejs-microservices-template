import 'reflect-metadata';
import express, { Express } from 'express';

import cors from 'cors';
import { Container } from 'typedi';
import { PORT } from './config/index.js';
import logger from './utils/logger.js';
import DatabaseConnection from './database/DatabaseConnection.js';
import PubSubService from './services/pubsub/PubSubService.js';
import CustomerController from './api/CustomerController.js';
import ErrorHandler from './handler/ErrorHandler.js';

const startServer = async () => {
  const app: Express = express();
  app.use(express.json());
  app.use(cors());

  Container.get(ErrorHandler).init(app);
  Container.get(CustomerController).init(app);

  const pubSubService = Container.get(PubSubService);
  await pubSubService.createConnection();

  await DatabaseConnection();

  // app.use(express.static(__dirname + '/public'));

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
