import { Service } from 'typedi';
import { ProductModel } from '../models/index.js';
import { Product } from '../models/Product.js';

//Dealing with data base operations
@Service()
export default class ProductRepository {
  async CreateProduct(product: Product): Promise<Product> {
    const newProduct: Product = new ProductModel(product);

    const productResult = await newProduct.save();
    return productResult;
  }

  async Products() {
    return await ProductModel.find();
  }

  async FindById(id: string): Promise<Product> {
    return await ProductModel.findById(id);
  }

  async FindByCategory(category: string): Promise<Array<Product>> {
    const products: Array<Product> = await ProductModel.find({
      type: category,
    });

    return products;
  }

  async FindSelectedProducts(selectedIds: Array<string>): Promise<Array<Product>> {
    const products: Array<Product> = await ProductModel.find()
      .where('_id')
      .in(selectedIds.map((_id) => _id))
      .exec();
    return products;
  }
}
