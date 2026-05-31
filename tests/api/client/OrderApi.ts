import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './BaseApi';

export class OrderApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createOrder(data: Record<string, any>) {
    return this.post('/orders', data);
  }

  async getOrders(params?: Record<string, any>) {
    return this.get('/orders', params);
  }

  async getOrder(id: string) {
    return this.get(`/orders/${id}`);
  }
}
