import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './BaseApi';

export class CategoryApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getCategories() {
    return this.get('/categories');
  }

  async getCategory(id: string) {
    return this.get(`/categories/${id}`);
  }

  async createCategory(data: Record<string, any>) {
    return this.post('/categories', data);
  }

  async updateCategory(id: string, data: Record<string, any>) {
    return this.put(`/categories/${id}`, data);
  }

  async deleteCategory(id: string) {
    return this.delete(`/categories/${id}`);
  }
}
