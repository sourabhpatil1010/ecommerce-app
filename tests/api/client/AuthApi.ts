import { APIRequestContext } from '@playwright/test';
import { BaseApi } from './BaseApi';

export class AuthApi extends BaseApi {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async login(username: string, password: string) {
    // FastAPI OAuth2PasswordRequestForm expects form data
    return this.postForm('/auth/login', { username, password });
  }

  async register(data: Record<string, any>) {
    return this.post('/auth/register', data);
  }

  async getMe() {
    return this.get('/users/me');
  }
}
