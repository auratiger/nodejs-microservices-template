import { Service } from 'typedi';
import { Express, Request, Response, NextFunction } from 'express';
import { IAddress } from '../database/models/Address.js';
import { ILogin } from '../database/models/Customer.js';
import CustomerService from '../services/customer/CustomerService.js';
import logger from '../utils/logger.js';
import UserAuth from './middlewares/UserAuth.js';
import { tryCatch } from '../handler/ErrorHandler.js';
import { HttpStatusCode } from 'axios';

@Service()
export default class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  public init(app: Express): void {
    app.post(
      '/signup',
      tryCatch(async (req: Request, res: Response) => {
        const { email, password, phone } = req.body;
        const { data } = await this.customerService.SignUp({
          email,
          password,
          phone,
        });

        res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.post(
      '/login',
      tryCatch(async (req: Request, res: Response) => {
        const { email, password }: ILogin = req.body;

        const { data } = await this.customerService.Login({ email, password });

        res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.post(
      '/address',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const { _id } = req.body._user;
        const address: IAddress = req.body;

        const { data } = await this.customerService.AddNewAddress(_id, address);

        res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.get(
      '/profile',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        logger.info('Fetching customer profile data');
        const { _id } = req.body._user;
        const { data } = await this.customerService.GetProfile(_id);
        res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.get(
      '/shoping-details',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const { _id } = req.body._user;
        const { data } = await this.customerService.GetShopingDetails(_id);

        return res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.get(
      '/wishlist',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const { _id } = req.body._user;
        const { data } = await this.customerService.GetWishList(_id);
        return res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.get('/whoami', (req: Request, res: Response, next: NextFunction) => {
      return res.status(HttpStatusCode.Ok).json({ msg: '/customer : I am Customer service' });
    });
  }
}
