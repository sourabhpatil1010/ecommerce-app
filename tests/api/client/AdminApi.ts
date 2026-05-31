import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './BaseApi';

export class AdminApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getStats() {
    return this.get('/dashboard/stats');
  }

  async getUsers() {
    return this.get('/users');
  }

  async updateOrderStatus(id: string, status: string) {
    return this.put(`/orders/${id}/status`, { status });
  }
}
