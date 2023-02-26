import { Service } from 'typedi';
import ShoppingRepository from '../../database/repository/ShoppingRepository.js';
import { FormateData } from '../../utils/utils.js';

// All Business logic will be here
@Service()
export default class ShoppingService {
  constructor(private readonly shoppingRepository: ShoppingRepository) {}

  async GetCart(userId: string) {
    const cartItems = await this.shoppingRepository.Cart(userId);
    return FormateData(cartItems);
  }

  async PlaceOrder(userId: string, txnNumber: string) {
    const orderResult = await this.shoppingRepository.CreateNewOrder(userId, txnNumber);

    return FormateData(orderResult);
  }

  async GetOrders(customerId: string) {
    const orders = await this.shoppingRepository.Orders(customerId);
    return FormateData(orders);
  }

  async GetOrderDetails(productId: string, { userId: string, orderId }) {
    const orders = await this.shoppingRepository.Orders(productId);
    return FormateData(orders);
  }

  async ManageCart(customerId: string, item, qty, isRemove) {
    const cartResult = await this.shoppingRepository.AddCartItem(customerId, item, qty, isRemove);
    return FormateData(cartResult);
  }

  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);
    const { event, data } = payload;
    const { userId, product, qty } = data;

    switch (event) {
      case 'ADD_TO_CART':
        this.ManageCart(userId, product, qty, false);
        break;
      case 'REMOVE_FROM_CART':
        this.ManageCart(userId, product, qty, true);
        break;
      default:
        break;
    }
  }

  async GetOrderPayload(userId: string, order: any, event: any) {
    if (order) {
      const payload = {
        event: event,
        data: { userId, order },
      };

      return payload;
    } else {
      return FormateData({ error: 'No Order Available' });
    }
  }
}
