import 'reflect-metadata';

import express, { Express } from 'express';
import cors from 'cors';
import DatabaseConnection from './database/DatabaseConnection.js';
import logger from './utils/logger.js';
import { Container } from 'typedi';
import ProductController from './api/ProductController.js';
import PubSubService from './services/pubsub/PubSubService.js';
import { PORT } from './config/index.js';
import ErrorHandler from './handler/ErrorHandler.js';

const StartServer = async () => {
  const app: Express = express();
  app.use(express.json());
  app.use(cors());

  Container.get(ErrorHandler).init(app);
  Container.get(ProductController).init(app);

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

StartServer();
