import { Service } from 'typedi';
import { Express, Request, Response, NextFunction } from 'express';
import { CUSTOMER_SERVICE } from '../config/index.js';
import PubSubService from '../services/pubsub/PubSubService.js';
import ShoppingService from '../services/shopping/ShoppingService.js';
import UserAuth from './middlewares/UserAuth.js';

@Service()
export default class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService, private readonly pubSubService: PubSubService) {}

  public init(app: Express): void {
    // NOTE: SubscribeMessage(channel, service);

    app.post('/order', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;
      const { txnNumber } = req.body;

      const { data } = await this.shoppingService.PlaceOrder(_id, txnNumber);

      const payload = await this.shoppingService.GetOrderPayload(_id, data, 'CREATE_ORDER');

      this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(payload));

      res.status(200).json(data);
    });

    app.get('/orders', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;

      const { data } = await this.shoppingService.GetOrders(_id);

      res.status(200).json(data);
    });

    // app.put('/cart', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
    //   const { _id } = req.user;

    //   const { data } = await this.shoppingService.AddToCart(_id, req.body._id);

    //   res.status(200).json(data);
    // });

    // app.delete('/cart/:id', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
    //   const { _id } = req.user;

    //   // TODO: const { data } = await this.shoppingService.AddToCart(_id, req.body._id);

    //   res.status(200).json(data);
    // });

    app.get('/cart', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;

      const { data } = await this.shoppingService.GetCart({ _id });

      return res.status(200).json(data);
    });

    app.get('/whoami', (req: Request, res: Response, next: NextFunction) => {
      return res.status(200).json({ msg: '/shoping : I am Shopping Service' });
    });
  }
}
