import { test, expect } from '@playwright/test';
import { OrderApi, CartApi, AddressApi, AuthApi, ProductApi } from '../client';
import { UserBuilder } from '../data/UserBuilder';
import { AddressBuilder } from '../data/AddressBuilder';
import { OrderBuilder } from '../data/OrderBuilder';
import { OrderSchema } from '../schemas/OrderSchema';

test.describe('Orders API Testing', () => {
  let orderApi: OrderApi;
  let cartApi: CartApi;
  let addressApi: AddressApi;
  let testAddressId: string;
  let testProductId: string;
  let createdOrderId: string;

  test.beforeAll(async ({ request }) => {
    orderApi = new OrderApi(request);
    cartApi = new CartApi(request);
    addressApi = new AddressApi(request);
    const authApi = new AuthApi(request);
    const productApi = new ProductApi(request);

    // Setup user
    const user = new UserBuilder().build();
    await authApi.register(user);
    const loginRes = await authApi.login(user.email, user.password);
    const token = (await loginRes.json()).access_token;
    
    orderApi.setToken(token);
    cartApi.setToken(token);
    addressApi.setToken(token);

    // Create Address
    const addressRes = await addressApi.addAddress(new AddressBuilder().build());
    testAddressId = (await addressRes.json()).id;

    // Get Product & Add to Cart
    const productsRes = await productApi.getProducts({ per_page: 1 });
    if (productsRes.ok()) {
      const data = await productsRes.json();
      if (data.items.length > 0) {
        testProductId = data.items[0].id;
        await cartApi.addItem(testProductId, 1);
      }
    }
  });

  test('POST /orders - Should create order from cart', async () => {
    if (!testAddressId || !testProductId) test.skip();

    const orderData = new OrderBuilder()
      .withAddress(testAddressId)
      .withPaymentMethod('COD')
      .build();

    const response = await orderApi.createOrder(orderData);
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(() => OrderSchema.parse(data)).not.toThrow();
    createdOrderId = data.id;
  });

  test('GET /orders - Should list user orders', async () => {
    const response = await orderApi.getOrders();
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items).toBeDefined();
  });

  test('GET /orders/{id} - Should get order details', async () => {
    if (!createdOrderId) test.skip();
    const response = await orderApi.getOrder(createdOrderId);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.id).toBe(createdOrderId);
  });
});
