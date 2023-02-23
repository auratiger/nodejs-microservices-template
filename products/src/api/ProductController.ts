import { Service } from 'typedi';
import { CUSTOMER_SERVICE, SHOPPING_SERVICE } from '../config/index.js';
import { IProduct } from '../database/models/Product.js';
import ProductService from '../services/products/ProductService.js';
import PubSubService from '../services/pubsub/PubSubService.js';
import UserAuth from './middlewares/UserAuth.js';

@Service()
export default class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly pubSubService: PubSubService,
  ) {}

  public init(app: any): void {
    app.post('/product/create', async (req, res, next) => {
      const product: IProduct = req.body;
      // validation
      const { data } = await this.productService.CreateProduct(product);
      return res.json(data);
    });

    app.get('/category/:type', async (req, res, next) => {
      const type: string = req.params.type;

      try {
        const { data } = await this.productService.GetProductsByCategory(type);
        return res.status(200).json(data);
      } catch (error) {
        return res.status(404).json({ error });
      }
    });

    app.get('/:id', async (req, res, next) => {
      const productId: string = req.params.id;

      try {
        const { data } = await this.productService.GetProductDescription(
          productId,
        );
        return res.status(200).json(data);
      } catch (error) {
        return res.status(404).json({ error });
      }
    });

    app.post('/ids', async (req, res, next) => {
      const { ids } = req.body;
      const products = await this.productService.GetSelectedProducts(ids);
      return res.status(200).json(products);
    });

    app.put('/wishlist', UserAuth, async (req, res, next) => {
      const { _id } = req.user;

      const { data } = await this.productService.GetProductPayload(
        _id,
        { productId: req.body._id },
        'ADD_TO_WISHLIST',
      );

      this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));

      res.status(200).json(data.data.product);
    });

    app.delete('/wishlist/:id', UserAuth, async (req, res, next) => {
      const { _id } = req.user;
      const productId = req.params.id;

      const { data } = await this.productService.GetProductPayload(
        _id,
        { productId },
        'REMOVE_FROM_WISHLIST',
      );
      this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));

      res.status(200).json(data.data.product);
    });

    app.put('/cart', UserAuth, async (req, res, next) => {
      const { _id } = req.user;

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

    app.delete('/cart/:id', UserAuth, async (req, res, next) => {
      const { _id } = req.user;
      const productId = req.params.id;

      const { data } = await this.productService.GetProductPayload(
        _id,
        { productId },
        'REMOVE_FROM_CART',
      );

      this.pubSubService.publishMessage(CUSTOMER_SERVICE, JSON.stringify(data));
      this.pubSubService.publishMessage(SHOPPING_SERVICE, JSON.stringify(data));

      const response = { product: data.data.product, unit: data.data.qty };

      res.status(200).json(response);
    });

    app.get('/whoami', (req, res, next) => {
      return res
        .status(200)
        .json({ msg: '/ or /products : I am products Service' });
    });

    //get Top products and category
    app.get('/', async (req, res, next) => {
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
