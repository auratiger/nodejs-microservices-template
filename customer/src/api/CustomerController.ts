import { Service } from 'typedi';
import { Express, Request, Response, NextFunction } from 'express';
import CustomerService from '../services/customer/CustomerService.js';
import logger from '../utils/logger.js';
import UserAuth from './middlewares/UserAuth.js';
import { tryCatch } from '../handler/ErrorHandler.js';
import { HttpStatusCode } from 'axios';
import { loginValidation, signUpValidation, addressValidation } from '../validators/index.js';
import { validate } from 'express-validation';

@Service()
export default class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  public getUserId(req: Request): string {
    return (req as Request & { user: { _id: string } }).user._id;
  }

  public init(app: Express): void {
    app.post(
      '/signup',
      validate(signUpValidation),
      tryCatch(async (req: Request, res: Response) => {
        const { data } = await this.customerService.SignUp(req.body);

        res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.post(
      '/login',
      validate(loginValidation),
      tryCatch(async (req: Request, res: Response) => {
        const { data } = await this.customerService.Login(req.body);

        res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.post(
      '/address',
      validate(addressValidation),
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const userId: string = this.getUserId(req);
        const { data } = await this.customerService.AddNewAddress(userId, req.body);

        res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.get(
      '/profile',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        logger.info('Fetching customer profile data');
        const userId: string = this.getUserId(req);
        const { data } = await this.customerService.GetProfile(userId);
        res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.get(
      '/shoping-details',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const userId: string = this.getUserId(req);
        const { data } = await this.customerService.GetShopingDetails(userId);

        return res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.get(
      '/wishlist',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const userId: string = this.getUserId(req);
        const { data } = await this.customerService.GetWishList(userId);
        return res.status(HttpStatusCode.Ok).json(data);
      }),
    );

    app.get('/whoami', (req: Request, res: Response, next: NextFunction) => {
      return res.status(HttpStatusCode.Ok).json({ msg: '/customer : I am Customer service' });
    });
  }
}
