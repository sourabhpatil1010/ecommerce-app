import { test, expect } from '@playwright/test';
import { ProductApi, AuthApi } from '../client';
import { ProductBuilder } from '../data/ProductBuilder';
import { UserBuilder } from '../data/UserBuilder';
import { ProductSchema, ProductListSchema } from '../schemas/ProductSchema';

test.describe('Products API Testing', () => {
  let productApi: ProductApi;
  let adminApi: ProductApi;
  let adminToken: string;

  const adminUser = new UserBuilder().withEmail('superadmin@example.com').withPassword('supersecret').build();
  let createdProductId: string;

  test.beforeAll(async ({ request }) => {
    productApi = new ProductApi(request);
    
    // Auth logic for admin (assuming superadmin exists from seeding, otherwise we'd register one or mock)
    const authApi = new AuthApi(request);
    const loginRes = await authApi.login('superadmin@example.com', 'admin123'); // Fallback password
    if (loginRes.ok()) {
      const { access_token } = await loginRes.json();
      adminToken = access_token;
      adminApi = new ProductApi(request);
      adminApi.setToken(adminToken);
    }
  });

  test('GET /products - Should return paginated list of products', async () => {
    const response = await productApi.getProducts({ page: 1, per_page: 5 });
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(() => ProductListSchema.parse(data)).not.toThrow();
    expect(data.page).toBe(1);
    expect(data.per_page).toBe(5);
  });

  test('GET /products - Should filter products by search query', async () => {
    const response = await productApi.getProducts({ search: 'Headphones' });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.items)).toBeTruthy();
  });

  test('POST /products - Admin should create a new product', async () => {
    // Skip if we don't have an admin token (e.g. tests running against unseeded DB)
    if (!adminToken) test.skip();

    const newProduct = new ProductBuilder().build();
    const response = await adminApi.createProduct(newProduct);
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(() => ProductSchema.parse(data)).not.toThrow();
    expect(data.name).toBe(newProduct.name);
    
    createdProductId = data.id;
  });

  test('POST /products - Unauthorized without admin token', async () => {
    const newProduct = new ProductBuilder().build();
    const response = await productApi.createProduct(newProduct); // Unauthenticated client
    expect(response.status()).toBe(401);
  });

  test('GET /products/{id} - Should return specific product details', async () => {
    if (!createdProductId) test.skip();
    
    const response = await productApi.getProduct(createdProductId);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.id).toBe(createdProductId);
  });

  test('GET /products/{id} - Should return 404 for invalid ID', async () => {
    const response = await productApi.getProduct('00000000-0000-0000-0000-000000000000');
    expect(response.status()).toBe(404);
  });

  test('PUT /products/{id} - Admin should update product', async () => {
    if (!adminToken || !createdProductId) test.skip();

    const updateData = { name: 'Updated Product Name', price: 99.99 };
    const response = await adminApi.updateProduct(createdProductId, updateData);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.name).toBe('Updated Product Name');
    expect(data.price).toBe(99.99);
  });

  test('DELETE /products/{id} - Admin should delete product', async () => {
    if (!adminToken || !createdProductId) test.skip();

    const response = await adminApi.deleteProduct(createdProductId);
    expect(response.status()).toBe(200); // Or 204 depending on implementation

    // Verify it's deleted
    const getRes = await productApi.getProduct(createdProductId);
    expect(getRes.status()).toBe(404);
  });
});
