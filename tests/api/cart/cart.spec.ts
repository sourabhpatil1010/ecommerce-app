import { test, expect } from '@playwright/test';
import { CartApi, AuthApi, ProductApi } from '../client';
import { UserBuilder } from '../data/UserBuilder';

test.describe('Cart API Testing', () => {
  let cartApi: CartApi;
  let authApi: AuthApi;
  let testProductId: string;
  let userToken: string;

  test.beforeAll(async ({ request }) => {
    cartApi = new CartApi(request);
    authApi = new AuthApi(request);
    const productApi = new ProductApi(request);

    // 1. Create user and login
    const user = new UserBuilder().build();
    await authApi.register(user);
    const loginRes = await authApi.login(user.email, user.password);
    userToken = (await loginRes.json()).access_token;
    cartApi.setToken(userToken);

    // 2. Fetch a product ID to test with
    const productsRes = await productApi.getProducts({ per_page: 1 });
    if (productsRes.ok()) {
      const data = await productsRes.json();
      if (data.items.length > 0) {
        testProductId = data.items[0].id;
      }
    }
  });

  test('POST /cart/items - Should add item to cart', async () => {
    if (!testProductId) test.skip();
    const response = await cartApi.addItem(testProductId, 2);
    expect(response.status()).toBe(200); // Or 201
    
    // Verify it's in the cart
    const getCartRes = await cartApi.getCart();
    const cartData = await getCartRes.json();
    const item = cartData.items.find((i: any) => i.product_id === testProductId);
    expect(item).toBeDefined();
    expect(item.quantity).toBe(2);
  });

  test('PUT /cart/items/{id} - Should update item quantity', async () => {
    if (!testProductId) test.skip();
    // Assuming the item ID in cart is the product ID for this test structure, 
    // or we fetch the specific cart item ID first.
    const getCartRes = await cartApi.getCart();
    const cartData = await getCartRes.json();
    const item = cartData.items.find((i: any) => i.product_id === testProductId);
    
    if (!item) test.skip();

    const response = await cartApi.updateItem(item.id, 5);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.quantity).toBe(5);
  });

  test('DELETE /cart/items/{id} - Should remove item from cart', async () => {
    if (!testProductId) test.skip();
    
    const getCartRes = await cartApi.getCart();
    const cartData = await getCartRes.json();
    const item = cartData.items.find((i: any) => i.product_id === testProductId);
    
    if (!item) test.skip();

    const response = await cartApi.removeItem(item.id);
    expect(response.status()).toBe(200);
  });

  test('DELETE /cart - Should empty the entire cart', async () => {
    // Add item first
    if (testProductId) {
      await cartApi.addItem(testProductId, 1);
    }

    const response = await cartApi.clearCart();
    expect(response.status()).toBe(200);

    const getCartRes = await cartApi.getCart();
    const cartData = await getCartRes.json();
    expect(cartData.items.length).toBe(0);
  });
});
