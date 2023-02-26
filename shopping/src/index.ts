import 'reflect-metadata';

import cors from 'cors';
import express from 'express';
import DatabaseConnection from './database/DatabaseConnection.js';
import { PORT } from './config/index.js';
import logger from './utils/logger.js';
import { Container } from 'typedi';
import PubSubService from './services/pubsub/PubSubService.js';
import ShoppingController from './api/ShoppingController.js';
import ErrorHandler from './handler/ErrorHandler.js';

const StartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  Container.get(ErrorHandler).init(app);
  Container.get(ShoppingController).init(app);

  const pubSubService = Container.get(PubSubService);
  await pubSubService.createConnection();

  await DatabaseConnection();

  // app.use(express.static(__dirname + '/public'));
  //
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

StartServer();
