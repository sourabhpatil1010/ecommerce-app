import { test, expect } from '@playwright/test';
import { AddressApi, AuthApi } from '../client';
import { AddressBuilder } from '../data/AddressBuilder';
import { UserBuilder } from '../data/UserBuilder';

test.describe('Addresses API Testing', () => {
  let addressApi: AddressApi;
  let testAddressId: string;

  test.beforeAll(async ({ request }) => {
    addressApi = new AddressApi(request);
    const authApi = new AuthApi(request);

    const user = new UserBuilder().build();
    await authApi.register(user);
    const loginRes = await authApi.login(user.email, user.password);
    addressApi.setToken((await loginRes.json()).access_token);
  });

  test('POST /addresses - Should add a new address', async () => {
    const newAddress = new AddressBuilder().build();
    const response = await addressApi.addAddress(newAddress);
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data.id).toBeDefined();
    testAddressId = data.id;
  });

  test('GET /addresses - Should list addresses', async () => {
    const response = await addressApi.getAddresses();
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test('PUT /addresses/{id} - Should update address', async () => {
    if (!testAddressId) test.skip();
    const updateData = new AddressBuilder().isDefault().build();
    const response = await addressApi.updateAddress(testAddressId, updateData);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.is_default).toBe(true);
  });

  test('DELETE /addresses/{id} - Should delete address', async () => {
    if (!testAddressId) test.skip();
    const response = await addressApi.deleteAddress(testAddressId);
    expect(response.status()).toBe(200);
  });
});
