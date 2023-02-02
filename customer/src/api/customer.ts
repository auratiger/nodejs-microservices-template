import CustomerService from '../services/customer/CustomerService';
import UserAuth from './middlewares/auth';
import { SubscribeMessage } from '../utils';
import Container from 'typedi';

export default (app: any, channel: any) => {
  const customerService = Container.get(CustomerService);

  // To listen
  SubscribeMessage(channel, customerService);

  app.post('/signup', async (req, res, next) => {
    const { email, password, phone } = req.body;
    const { data } = await customerService.SignUp({ email, password, phone });
    res.json(data);
  });

  app.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    const { data } = await customerService.SignIn({ email, password });

    res.json(data);
  });

  app.post('/address', UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    const { street, postalCode, city, country } = req.body;

    const { data } = await customerService.AddNewAddress(_id, {
      street,
      postalCode,
      city,
      country,
    });

    res.json(data);
  });

  app.get('/profile', UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await customerService.GetProfile({ _id });
    res.json(data);
  });

  app.get('/shoping-details', UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await customerService.GetShopingDetails(_id);

    return res.json(data);
  });

  app.get('/wishlist', UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await customerService.GetWishList(_id);
    return res.status(200).json(data);
  });

  app.get('/whoami', (req, res, next) => {
    return res.status(200).json({ msg: '/customer : I am Customer service' });
  });
};
