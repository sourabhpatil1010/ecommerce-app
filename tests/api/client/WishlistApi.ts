import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './BaseApi';

export class WishlistApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getWishlist() {
    return this.get('/wishlist');
  }

  async addProduct(product_id: string) {
    return this.post(`/wishlist/${product_id}`);
  }

  async removeProduct(product_id: string) {
    return this.delete(`/wishlist/${product_id}`);
  }
}
