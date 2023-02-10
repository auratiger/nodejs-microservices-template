import 'reflect-metadata';

import cors from 'cors';
import express from 'express';
import DatabaseConnection from './database/DatabaseConnection.js';
import { PORT } from './config/index.js';
import logger from './utils/logger.js';

const StartServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  await DatabaseConnection();

  // const pubSubService = Container.get(PubSubService);
  // await pubSubService.createConnection();

  // Container.get(ShoppingService).init(app);

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
      // pubSubService.close();
    });
};

StartServer();
