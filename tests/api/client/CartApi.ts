import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './BaseApi';

export class CartApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getCart() {
    return this.get('/cart');
  }

  async addItem(product_id: string, quantity: number = 1) {
    return this.post('/cart/items', { product_id, quantity });
  }

  async updateItem(item_id: string, quantity: number) {
    return this.put(`/cart/items/${item_id}`, { quantity });
  }

  async removeItem(item_id: string) {
    return this.delete(`/cart/items/${item_id}`);
  }

  async clearCart() {
    return this.delete('/cart');
  }
}
