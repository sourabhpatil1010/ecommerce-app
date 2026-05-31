import { APIRequestContext, APIResponse } from '@playwright/test';

export abstract class BaseApi {
  protected request: APIRequestContext;
  protected token?: string;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  setToken(token: string) {
    this.token = token;
  }

  protected getHeaders(customHeaders?: Record<string, string>) {
    const headers: Record<string, string> = { ...customHeaders };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  protected async get(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(endpoint, {
      params,
      headers: this.getHeaders(headers),
    });
  }

  protected async post(endpoint: string, data?: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.post(endpoint, {
      data,
      headers: this.getHeaders(headers),
    });
  }

  protected async postForm(endpoint: string, form: Record<string, string | number | boolean>, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.post(endpoint, {
      form,
      headers: this.getHeaders(headers),
    });
  }

  protected async put(endpoint: string, data?: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.put(endpoint, {
      data,
      headers: this.getHeaders(headers),
    });
  }

  protected async delete(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.delete(endpoint, {
      headers: this.getHeaders(headers),
    });
  }
}
