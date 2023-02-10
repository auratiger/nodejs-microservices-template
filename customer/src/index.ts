import 'reflect-metadata';
import express from 'express';

import cors from 'cors';
import { Container } from 'typedi';
import { PORT } from './config/index.js';
import logger from './utils/logger.js';
import DatabaseConnection from './database/DatabaseConnection.js';
import PubSubService from './services/pubsub/PubSubService.js';
import appEvents from './api/app-events.js';
import CustomerController from './api/CustomerController.js';

const startServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const pubSubService = Container.get(PubSubService);
  await pubSubService.createConnection();

  Container.get(CustomerController).init(app);

  await DatabaseConnection();

  //api
  appEvents(app);
  app.use(express.static(__dirname + '/public'));

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
