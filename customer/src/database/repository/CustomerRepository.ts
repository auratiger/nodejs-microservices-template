import { Service } from 'typedi';
import { CustomerModel, AddressModel } from '../models/index.js';
import { IAddress } from '../models/Address.js';
import { Customer } from '../models/Customer.js';
import logger from '../../utils/logger.js';

//Dealing with data base operations
@Service()
export default class CustomerRepository {
  async CreateCustomer({ email, password, phone, salt }) {
    const customer = new CustomerModel({
      email,
      password,
      salt,
      phone,
      address: [],
    });

    const customerResult = await customer.save();
    return customerResult;
  }

  async CreateAddress(userId: string, address: IAddress): Promise<void> {
    const profile: Customer = await CustomerModel.findById(userId);

    if (!profile) {
      logger.error(`customer: ${userId} is not found`);
      throw Error;
    }

    const newAddress: IAddress = new AddressModel(address);

    await newAddress.save();

    profile.address.push(newAddress);
    await profile.save();
  }

  async FindCustomer(email: string): Promise<Customer> {
    const existingCustomer = await CustomerModel.findOne({ email: email });
    if (!existingCustomer) {
      logger.error(`customer with email: ${email} is not found`);
      throw Error;
    }
    return existingCustomer;
  }

  async FindCustomerById(userId: string): Promise<Customer> {
    const existingCustomer: Customer = await CustomerModel.findById(userId);
    if (!existingCustomer) {
      logger.error(`customer: ${userId} is not found`);
      throw Error;
    }
    return existingCustomer;
  }

  async GetCustomerWishlist(customerId: string) {
    const profile: Customer = await CustomerModel.findById(customerId);
    if (!profile) {
      logger.error(`customer: ${customerId} is not found`);
      throw Error;
    }

    return profile.wishlist;
  }

  async AddWishlistItem(customerId: string, { _id, name, desc, price, available, banner }) {
    const product: any = {
      _id,
      name,
      desc,
      price,
      available,
      banner,
    };

    const profile: Customer = await CustomerModel.findById(customerId);

    if (!profile) {
      logger.error(`customer: ${customerId} is not found`);
      throw Error;
    }

    const wishlist: Array<any> = profile.wishlist;

    if (wishlist.length > 0) {
      let isExist = false;
      wishlist.map((item: any) => {
        if (item._id.toString() === product._id.toString()) {
          const index = wishlist.indexOf(item);
          wishlist.splice(index, 1);
          isExist = true;
        }
      });

      if (!isExist) {
        wishlist.push(product);
      }
    } else {
      wishlist.push(product);
    }

    profile.wishlist = wishlist;
    const profileResult = await profile.save();

    return profileResult.wishlist;
  }

  async AddCartItem(customerId: string, { _id, name, price, banner }, qty: any, isRemove: boolean) {
    const profile: Customer = await CustomerModel.findById(customerId).populate('cart');

    if (profile) {
      const cartItem = {
        product: { _id, name, price, banner },
        unit: qty,
      };

      const cartItems: Array<any> = profile.cart;

      if (cartItems.length > 0) {
        let isExist = false;
        cartItems.map((item) => {
          if (item.product._id.toString() === _id.toString()) {
            if (isRemove) {
              cartItems.splice(cartItems.indexOf(item), 1);
            } else {
              item.unit = qty;
            }
            isExist = true;
          }
        });

        if (!isExist) {
          cartItems.push(cartItem);
        }
      } else {
        cartItems.push(cartItem);
      }

      profile.cart = cartItems;

      return await profile.save();
    }

    throw new Error('Unable to add to cart!');
  }

  async AddOrderToProfile(customerId: string, order: any) {
    const profile = await CustomerModel.findById(customerId);

    if (profile) {
      if (profile.orders == undefined) {
        profile.orders = [];
      }
      profile.orders.push(order);

      profile.cart = [];

      const profileResult = await profile.save();

      return profileResult;
    }

    throw new Error('Unable to add to order!');
  }
}
