import { Service } from 'typedi';
import { Express, Request, Response, NextFunction } from 'express';
import { IAddress } from '../database/models/Address.js';
import { ILogin } from '../database/models/Customer.js';
import CustomerService from '../services/customer/CustomerService.js';
import logger from '../utils/logger.js';
import UserAuth from './middlewares/UserAuth.js';

@Service()
export default class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  public init(app: Express): void {
    app.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, phone } = req.body;
      const { data } = await this.customerService.SignUp({
        email,
        password,
        phone,
      });
      res.json(data);
    });

    app.post('/login', async (req: Request, res: Response, next: NextFunction) => {
      const { email, password }: ILogin = req.body;

      const { data } = await this.customerService.Login({ email, password });

      res.json(data);
    });

    app.post('/address', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;
      const address: IAddress = req.body;

      const { data } = await this.customerService.AddNewAddress(_id, address);

      res.json(data);
    });

    app.get('/profile', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      logger.info('Fetching customer profile data');
      const { _id } = req.body._user;
      const { data } = await this.customerService.GetProfile(_id);
      res.json(data);
    });

    app.get('/shoping-details', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;
      const { data } = await this.customerService.GetShopingDetails(_id);

      return res.json(data);
    });

    app.get('/wishlist', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;
      const { data } = await this.customerService.GetWishList(_id);
      return res.status(200).json(data);
    });

    app.get('/whoami', (req: Request, res: Response, next: NextFunction) => {
      return res.status(200).json({ msg: '/customer : I am Customer service' });
    });
  }
}
