import CustomerService from '../services/customer-service';

export default (app) => {
  const service = new CustomerService();
  app.use('/app-events', async (req, res, next) => {
    const { payload } = req.body;

    //handle subscribe events
    service.SubscribeEvents(payload);

    console.log('============= Shopping ================');
    console.log(payload);
    res.json(payload);
  });
};
