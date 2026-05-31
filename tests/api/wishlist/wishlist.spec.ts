import { test, expect } from '@playwright/test';
import { WishlistApi, AuthApi, ProductApi } from '../client';
import { UserBuilder } from '../data/UserBuilder';

test.describe('Wishlist API Testing', () => {
  let wishlistApi: WishlistApi;
  let testProductId: string;

  test.beforeAll(async ({ request }) => {
    wishlistApi = new WishlistApi(request);
    const authApi = new AuthApi(request);
    const productApi = new ProductApi(request);

    const user = new UserBuilder().build();
    await authApi.register(user);
    const loginRes = await authApi.login(user.email, user.password);
    wishlistApi.setToken((await loginRes.json()).access_token);

    const productsRes = await productApi.getProducts({ per_page: 1 });
    if (productsRes.ok()) {
      const data = await productsRes.json();
      if (data.items.length > 0) testProductId = data.items[0].id;
    }
  });

  test('POST /wishlist/{id} - Should add product to wishlist', async () => {
    if (!testProductId) test.skip();
    const response = await wishlistApi.addProduct(testProductId);
    expect(response.status()).toBe(200); // or 201
  });

  test('GET /wishlist - Should return user wishlist', async () => {
    const response = await wishlistApi.getWishlist();
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('DELETE /wishlist/{id} - Should remove product from wishlist', async () => {
    if (!testProductId) test.skip();
    const response = await wishlistApi.removeProduct(testProductId);
    expect(response.status()).toBe(200);
  });
});
