import { Service } from 'typedi';
import { Express, Request, Response, NextFunction } from 'express';
import { CUSTOMER_SERVICE, SHOPPING_SERVICE } from '../config/index.js';
import { IProduct } from '../database/models/Product.js';
import ProductService from '../services/products/ProductService.js';
import PubSubService from '../services/pubsub/PubSubService.js';
import UserAuth from './middlewares/UserAuth.js';

@Service()
export default class ProductController {
  constructor(private readonly productService: ProductService, private readonly pubSubService: PubSubService) {}

  public init(app: Express): void {
    app.post('/product/create', async (req: Request, res: Response, next: NextFunction) => {
      const product: IProduct = req.body;
      // validation
      const { data } = await this.productService.CreateProduct(product);
      return res.json(data);
    });

    app.get('/category/:type', async (req: Request, res: Response, next: NextFunction) => {
      const type: string = req.params.type;

      try {
        const { data } = await this.productService.GetProductsByCategory(type);
        return res.status(200).json(data);
      } catch (error) {
        return res.status(404).json({ error });
      }
    });

    app.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
      const productId: string = req.params.id;

      try {
        const { data } = await this.productService.GetProductDescription(productId);
        return res.status(200).json(data);
      } catch (error) {
        return res.status(404).json({ error });
      }
    });

    app.post('/ids', async (req: Request, res: Response, next: NextFunction) => {
      const { ids } = req.body;
      const products = await this.productService.GetSelectedProducts(ids);
      return res.status(200).json(products);
    });

    app.put('/wishlist', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;

      const { data } = await this.productService.GetProductPayload(_id, { productId: req.body._id }, 'ADD_TO_WISHLIST');

      this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));

      res.status(200).json(data.data.product);
    });

    app.delete('/wishlist/:id', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;
      const productId = req.params.id;

      const { data } = await this.productService.GetProductPayload(_id, { productId }, 'REMOVE_FROM_WISHLIST');
      this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));

      res.status(200).json(data.data.product);
    });

    app.put('/cart', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;

      const { data } = await this.productService.GetProductPayload(
        _id,
        { productId: req.body._id, qty: req.body.qty },
        'ADD_TO_CART',
      );

      this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));
      this.pubSubService.publishMessage(SHOPPING_SERVICE, JSON.stringify(data));

      const response = { product: data.data.product, unit: data.data.qty };

      res.status(200).json(response);
    });

    app.delete('/cart/:id', UserAuth, async (req: Request, res: Response, next: NextFunction) => {
      const { _id } = req.body._user;
      const productId = req.params.id;

      const { data } = await this.productService.GetProductPayload(_id, { productId }, 'REMOVE_FROM_CART');

      this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));
      this.pubSubService.publishMessage(SHOPPING_SERVICE, JSON.stringify(data));

      const response = { product: data.data.product, unit: data.data.qty };

      res.status(200).json(response);
    });

    app.get('/whoami', (req: Request, res: Response, next: NextFunction) => {
      return res.status(200).json({ msg: '/ or /products : I am products Service' });
    });

    //get Top products and category
    app.get('/', async (req: Request, res: Response, next: NextFunction) => {
      //check validation
      try {
        const { data } = await this.productService.GetProducts();
        return res.status(200).json(data);
      } catch (error) {
        return res.status(404).json({ error });
      }
    });
  }
}
