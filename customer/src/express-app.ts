import express from 'express';
import cors from 'cors';
import { customerController, appEvents } from './api';

export default async (app: express.Application, channel: any) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.static(__dirname + '/public'));

  //api
  appEvents(app);

  customerController(app, channel);
  // error handling
};
