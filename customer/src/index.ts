import 'reflect-metadata';
import express from 'express';
import { PORT } from './config';
import { CreateChannel } from './utils';

import { databaseConnection } from './database';
import expressApp from './express-app';
import logger from './utils/logger';

const startServer = async () => {
  const app = express();

  await databaseConnection();

  const channel = await CreateChannel();
  await expressApp(app, channel);

  app
    .listen(PORT, () => {
      logger.info(`listening to port ${PORT}`);
    })
    .on('error', (err) => {
      logger.error(err);
      process.exit();
    })
    .on('close', () => {
      channel.close();
    });
};

startServer();
