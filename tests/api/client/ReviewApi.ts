import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './BaseApi';

export class ReviewApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getProductReviews(product_id: string) {
    return this.get(`/reviews/product/${product_id}`);
  }

  async addReview(data: Record<string, any>) {
    return this.post('/reviews', data);
  }

  async updateReview(id: string, data: Record<string, any>) {
    return this.put(`/reviews/${id}`, data);
  }

  async deleteReview(id: string) {
    return this.delete(`/reviews/${id}`);
  }
}
