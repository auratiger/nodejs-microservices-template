import { Service } from 'typedi';
import ShoppingRepository from '../../database/repository/ShoppingRepository.js';
import { FormateData } from '../../utils/index.js';

// All Business logic will be here
@Service()
export default class ShoppingService {
  constructor(private readonly shoppingRepository: ShoppingRepository) {}

  async GetCart({ _id }) {
    const cartItems = await this.shoppingRepository.Cart(_id);
    return FormateData(cartItems);
  }

  async PlaceOrder(userInput) {
    const { _id, txnNumber } = userInput;

    const orderResult = await this.shoppingRepository.CreateNewOrder(
      _id,
      txnNumber,
    );

    return FormateData(orderResult);
  }

  async GetOrders(customerId) {
    const orders = await this.shoppingRepository.Orders(customerId);
    return FormateData(orders);
  }

  async GetOrderDetails(productId, { _id, orderId }) {
    const orders = await this.shoppingRepository.Orders(productId);
    return FormateData(orders);
  }

  async ManageCart(customerId, item, qty, isRemove) {
    const cartResult = await this.shoppingRepository.AddCartItem(
      customerId,
      item,
      qty,
      isRemove,
    );
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

  async GetOrderPayload(userId, order, event) {
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
