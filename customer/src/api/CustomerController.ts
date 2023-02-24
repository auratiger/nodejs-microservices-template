import { Service } from 'typedi';
import { IAddress } from '../database/models/Address.js';
import { ILogin } from '../database/models/Customer.js';
import CustomerService from '../services/customer/CustomerService.js';
import logger from '../utils/logger.js';
import UserAuth from './middlewares/auth.js';

@Service()
export default class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  public init(app: any): void {
    app.post('/signup', async (req, res, next) => {
      const { email, password, phone } = req.body;
      const { data } = await this.customerService.SignUp({
        email,
        password,
        phone,
      });
      res.json(data);
    });

    app.post('/login', async (req, res, next) => {
      const { email, password }: ILogin = req.body;

      const { data } = await this.customerService.Login({ email, password });

      res.json(data);
    });

    app.post('/address', UserAuth, async (req, res, next) => {
      const { _id } = req.user;
      const address: IAddress = req.body;

      const { data } = await this.customerService.AddNewAddress(_id, address);

      res.json(data);
    });

    app.get('/profile', UserAuth, async (req, res, next) => {
      logger.info('Fetching customer profile data');
      const { _id } = req.user;
      const { data } = await this.customerService.GetProfile(_id);
      res.json(data);
    });

    app.get('/shoping-details', UserAuth, async (req, res, next) => {
      const { _id } = req.user;
      const { data } = await this.customerService.GetShopingDetails(_id);

      return res.json(data);
    });

    app.get('/wishlist', UserAuth, async (req, res, next) => {
      const { _id } = req.user;
      const { data } = await this.customerService.GetWishList(_id);
      return res.status(200).json(data);
    });

    app.get('/whoami', (req, res, next) => {
      return res.status(200).json({ msg: '/customer : I am Customer service' });
    });
  }
}
