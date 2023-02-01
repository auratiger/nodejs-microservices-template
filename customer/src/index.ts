import express from 'express';
import { PORT } from './config';

import { databaseConnection } from './database';
// import expressApp from './express-app';

const startServer = async () => {
  const app = express();

  await databaseConnection();

  // await expressApp(app);

  app
    .listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    })
    .on('error', (err) => {
      console.log(err);
      process.exit();
    })
    .on('close', () => {
      // channel.close();
    });
};

startServer();
