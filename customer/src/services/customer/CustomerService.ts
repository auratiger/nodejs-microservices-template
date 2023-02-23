import { Service } from 'typedi';
import CustomerRepository from '../../database/repository/CustomerRepository.js';
import {
  FormateData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from '../../utils/utils.js';
import logger from '../../utils/logger.js';
import { ICustomer, ILogin, ISignUp } from '../../database/models/Customer.js';
import { IAddress } from '../../database/models/Address.js';

// All Business logic will be here
@Service()
export default class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async Login(userInputs: ILogin) {
    const existingCustomer = await this.customerRepository.FindCustomer(
      userInputs.email,
    );

    if (existingCustomer) {
      const validPassword = await ValidatePassword(
        userInputs.password,
        existingCustomer.password,
        existingCustomer.salt,
      );
      if (validPassword) {
        const token = await GenerateSignature({
          email: existingCustomer.email,
          _id: existingCustomer._id,
        });
        return FormateData({ id: existingCustomer._id, token });
      }
    }

    return FormateData(null);
  }

  async SignUp(userInputs: ISignUp) {
    const { email, password, phone } = userInputs;

    // create salt
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    // TODO: does this function check if user already exists, and what error does it throw
    const existingCustomer = await this.customerRepository.CreateCustomer({
      email,
      password: userPassword,
      phone,
      salt,
    });

    const token = await GenerateSignature({
      email: email,
      _id: existingCustomer._id,
    });

    return FormateData({ id: existingCustomer._id, token });
  }

  async AddNewAddress(userId: string, address: IAddress) {
    // TODO: what happens if address exists
    const addressResult = await this.customerRepository.CreateAddress(
      userId,
      address,
    );

    return FormateData(addressResult);
  }

  async GetProfile(userId: string) {
    const existingCustomer: ICustomer =
      await this.customerRepository.FindCustomerById(userId);
    return FormateData(existingCustomer);
  }

  async GetShopingDetails(userId: string) {
    const existingCustomer = await this.customerRepository.FindCustomerById(
      userId,
    );

    if (existingCustomer) {
      return FormateData(existingCustomer);
    }
    return FormateData({ msg: 'Error' });
  }

  async GetWishList(customerId: string) {
    const wishListItems = await this.customerRepository.GetCustomerWishlist(
      customerId,
    );
    return FormateData(wishListItems);
  }

  async AddToWishlist(customerId: string, product: any) {
    const wishlistResult = await this.customerRepository.AddWishlistItem(
      customerId,
      product,
    );
    return FormateData(wishlistResult);
  }

  async ManageCart(
    customerId: string,
    product: any,
    qty: any,
    isRemove: boolean,
  ) {
    const cartResult = await this.customerRepository.AddCartItem(
      customerId,
      product,
      qty,
      isRemove,
    );
    return FormateData(cartResult);
  }

  async ManageOrder(customerId: string, order: any) {
    const orderResult = await this.customerRepository.AddOrderToProfile(
      customerId,
      order,
    );
    return FormateData(orderResult);
  }

  async SubscribeEvents(payload: any) {
    logger.info('Triggering.... Customer Events');

    payload = JSON.parse(payload);

    const { event, data } = payload;

    const { userId, product, order, qty } = data;

    switch (event) {
      case 'ADD_TO_WISHLIST':
      case 'REMOVE_FROM_WISHLIST':
        this.AddToWishlist(userId, product);
        break;
      case 'ADD_TO_CART':
        this.ManageCart(userId, product, qty, false);
        break;
      case 'REMOVE_FROM_CART':
        this.ManageCart(userId, product, qty, true);
        break;
      case 'CREATE_ORDER':
        this.ManageOrder(userId, order);
        break;
      default:
        break;
    }
  }
}
