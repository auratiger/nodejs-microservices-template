import 'reflect-metadata';

import express from 'express';
import cors from 'cors';
import DatabaseConnection from './database/DatabaseConnection.js';
import logger from './utils/logger.js';
import { Container } from 'typedi';
import ProductController from './api/ProductController.js';
import PubSubService from './services/pubsub/PubSubService.js';
import { PORT } from './config/index.js';

const StartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  await DatabaseConnection();

  const pubSubService = Container.get(PubSubService);
  await pubSubService.createConnection();

  Container.get(ProductController).init(app);

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

StartServer();