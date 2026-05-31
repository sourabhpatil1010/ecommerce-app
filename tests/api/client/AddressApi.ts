import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './BaseApi';

export class AddressApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getAddresses() {
    return this.get('/addresses');
  }

  async addAddress(data: Record<string, any>) {
    return this.post('/addresses', data);
  }

  async updateAddress(id: string, data: Record<string, any>) {
    return this.put(`/addresses/${id}`, data);
  }

  async deleteAddress(id: string) {
    return this.delete(`/addresses/${id}`);
  }
}
