import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './BaseApi';

export class ProductApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getProducts(params?: Record<string, any>) {
    return this.get('/products', params);
  }

  async getProduct(id: string) {
    return this.get(`/products/${id}`);
  }

  async createProduct(data: Record<string, any>) {
    return this.post('/products', data);
  }

  async updateProduct(id: string, data: Record<string, any>) {
    return this.put(`/products/${id}`, data);
  }

  async deleteProduct(id: string) {
    return this.delete(`/products/${id}`);
  }
}
