import { Service } from 'typedi';
import mongoose from 'mongoose';
import { CustomerModel, AddressModel } from '../models/index.js';
import { IAddress } from '../models/Address.js';
import { ICustomer } from '../models/Customer.js';

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

  // TODO: use address object type here
  async CreateAddress(userId: string, address: IAddress) {
    const profile = await CustomerModel.findById(userId);

    if (profile) {
      const newAddress: IAddress = new AddressModel(address);

      await newAddress.save();

      profile.address.push(newAddress);
    }

    return await profile.save();
  }

  async FindCustomer(email: string): Promise<ICustomer> {
    const existingCustomer = await CustomerModel.findOne({ email: email });
    return existingCustomer;
  }

  async FindCustomerById(userId: string): Promise<ICustomer> {
    const existingCustomer: ICustomer = await CustomerModel.findById(userId);
    return existingCustomer;
  }

  async GetCustomerWishlist(customerId: string) {
    const profile = await CustomerModel.findById(customerId);

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

    const profile: ICustomer = await CustomerModel.findById(customerId).populate('wishlist');

    if (profile) {
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
    }

    const profileResult = await profile.save();

    return profileResult.wishlist;
  }

  async AddCartItem(customerId: string, { _id, name, price, banner }, qty: any, isRemove: boolean) {
    const profile: ICustomer = await CustomerModel.findById(customerId).populate('cart');

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
