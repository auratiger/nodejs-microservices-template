import CustomerService from '../services/customer/CustomerService';
import Container from 'typedi';

export default (app: any) => {
  const customerService = Container.get(CustomerService);

  app.use('/app-events', async (req, res, next) => {
    const { payload } = req.body;

    //handle subscribe events
    customerService.SubscribeEvents(payload);

    console.log('============= Shopping ================');
    console.log(payload);
    res.json(payload);
  });
};
