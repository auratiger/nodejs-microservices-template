import { Container } from 'typedi';
import CustomerService from '../services/customer/CustomerService.js';
import logger from '../utils/logger.js';

export default (app: any) => {
  const customerService = Container.get(CustomerService);

  app.use('/app-events', async (req, res, next) => {
    const { payload } = req.body;

    //handle subscribe events
    customerService.SubscribeEvents(payload);

    logger.info('============= Shopping ================');
    logger.info(payload);
    res.json(payload);
  });
};
