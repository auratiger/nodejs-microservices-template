import express from 'express';
import cors from 'cors';
import appEvents from './api/app-events.js';
import CustomerController from './api/CustomerController.js';
import { Container } from 'typedi';

export default async (app: express.Application) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.static(__dirname + '/public'));

  //api
  appEvents(app);

  const customerController = Container.get(CustomerController);
  customerController.init(app);
};
