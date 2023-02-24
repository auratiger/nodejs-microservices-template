// All Business logic will be here

import { Service } from 'typedi';
import { IProduct } from '../../database/models/Product.js';
import ProductRepository from '../../database/repository/ProductRepository.js';
import { FormateData } from '../../utils/index.js';

@Service()
export default class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async CreateProduct(product: IProduct) {
    const productResult = await this.productRepository.CreateProduct(product);
    return FormateData(productResult);
  }

  async GetProducts() {
    const products = await this.productRepository.Products();

    const categories = {};

    products.map(({ type }) => {
      categories[type] = type;
    });

    return FormateData({
      products,
      categories: Object.keys(categories),
    });
  }

  async GetProductDescription(productId: string) {
    const product = await this.productRepository.FindById(productId);
    return FormateData(product);
  }

  async GetProductsByCategory(category: string) {
    const products: Array<IProduct> = await this.productRepository.FindByCategory(category);
    return FormateData(products);
  }

  async GetSelectedProducts(selectedIds: Array<string>) {
    const products = await this.productRepository.FindSelectedProducts(selectedIds);
    return FormateData(products);
  }

  async GetProductPayload(userId: string, { productId, qty }: any, event: any) {
    const product = await this.productRepository.FindById(productId);

    if (product) {
      const payload = {
        event: event,
        data: { userId, product, qty },
      };

      return FormateData(payload);
    } else {
      return FormateData({ error: 'No product Available' });
    }
  }
}
