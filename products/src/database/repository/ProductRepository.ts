import mongoose from 'mongoose';
import { Service } from 'typedi';
import { ProductModel } from '../models/index.js';
import { IProduct } from '../models/Product.js';

//Dealing with data base operations
@Service()
export default class ProductRepository {
  async CreateProduct(product: IProduct): Promise<IProduct> {
    const newProduct: IProduct = new ProductModel(product);

    const productResult = await newProduct.save();
    return productResult;
  }

  async Products() {
    return await ProductModel.find();
  }

  async FindById(id: string): Promise<IProduct> {
    return await ProductModel.findById(id);
  }

  async FindByCategory(category: string): Promise<Array<IProduct>> {
    const products: Array<IProduct> = await ProductModel.find({
      type: category,
    });

    return products;
  }

  async FindSelectedProducts(
    selectedIds: Array<string>,
  ): Promise<Array<IProduct>> {
    const products: Array<IProduct> = await ProductModel.find()
      .where('_id')
      .in(selectedIds.map((_id) => _id))
      .exec();
    return products;
  }
}
