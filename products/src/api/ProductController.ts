import { Service } from 'typedi';
import { Express, Request, Response, NextFunction } from 'express';
import { CUSTOMER_SERVICE, SHOPPING_SERVICE } from '../config/index.js';
import ProductService from '../services/products/ProductService.js';
import PubSubService from '../services/pubsub/PubSubService.js';
import UserAuth from './middlewares/UserAuth.js';
import { tryCatch } from '../handler/ErrorHandler.js';
import { validate } from 'express-validation';
import { productValidator } from '../validators/ProductValidator.js';

@Service()
export default class ProductController {
  constructor(private readonly productService: ProductService, private readonly pubSubService: PubSubService) {}

  public getUserId(req: Request): string {
    return (req as Request & { user: { _id: string } }).user._id;
  }

  public init(app: Express): void {
    app.post(
      '/product/create',
      validate(productValidator),
      tryCatch(async (req: Request, res: Response) => {
        // validation
        const { data } = await this.productService.CreateProduct(req.body);
        return res.json(data);
      }),
    );

    app.get(
      '/category/:type',
      tryCatch(async (req: Request, res: Response) => {
        const type: string = req.params.type;

        try {
          const { data } = await this.productService.GetProductsByCategory(type);
          return res.status(200).json(data);
        } catch (error) {
          return res.status(404).json({ error });
        }
      }),
    );

    app.get(
      '/:id',
      tryCatch(async (req: Request, res: Response) => {
        const productId: string = req.params.id;

        try {
          const { data } = await this.productService.GetProductDescription(productId);
          return res.status(200).json(data);
        } catch (error) {
          return res.status(404).json({ error });
        }
      }),
    );

    app.post(
      '/ids',
      tryCatch(async (req: Request, res: Response) => {
        const { ids } = req.body;
        const products = await this.productService.GetSelectedProducts(ids);
        return res.status(200).json(products);
      }),
    );

    app.put(
      '/wishlist',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const userId: string = this.getUserId(req);

        const { data } = await this.productService.GetProductPayload(
          userId,
          { productId: req.body._id },
          'ADD_TO_WISHLIST',
        );

        this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));

        res.status(200).json(data.data.product);
      }),
    );

    app.delete(
      '/wishlist/:id',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const userId: string = this.getUserId(req);
        const productId = req.params.id;

        const { data } = await this.productService.GetProductPayload(userId, { productId }, 'REMOVE_FROM_WISHLIST');
        this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));

        res.status(200).json(data.data.product);
      }),
    );

    app.put(
      '/cart',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const userId: string = this.getUserId(req);

        const { data } = await this.productService.GetProductPayload(
          userId,
          { productId: req.body._id, qty: req.body.qty },
          'ADD_TO_CART',
        );

        this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));
        this.pubSubService.publishMessage(SHOPPING_SERVICE, JSON.stringify(data));

        const response = { product: data.data.product, unit: data.data.qty };

        res.status(200).json(response);
      }),
    );

    app.delete(
      '/cart/:id',
      UserAuth,
      tryCatch(async (req: Request, res: Response) => {
        const userId: string = this.getUserId(req);
        const productId = req.params.id;

        const { data } = await this.productService.GetProductPayload(userId, { productId }, 'REMOVE_FROM_CART');

        this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));
        this.pubSubService.publishMessage(SHOPPING_SERVICE, JSON.stringify(data));

        const response = { product: data.data.product, unit: data.data.qty };

        res.status(200).json(response);
      }),
    );

    app.get('/whoami', async (req: Request, res: Response, next: NextFunction) => {
      return res.status(200).json({ msg: '/ or /products : I am products Service' });
    });

    //get Top products and category
    app.get(
      '/',
      tryCatch(async (req: Request, res: Response) => {
        //check validation
        try {
          const { data } = await this.productService.GetProducts();
          return res.status(200).json(data);
        } catch (error) {
          return res.status(404).json({ error });
        }
      }),
    );
  }
}
