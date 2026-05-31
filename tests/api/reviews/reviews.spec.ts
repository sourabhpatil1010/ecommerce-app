import { test, expect } from '@playwright/test';
import { ReviewApi, AuthApi, ProductApi } from '../client';
import { UserBuilder } from '../data/UserBuilder';

test.describe('Reviews API Testing', () => {
  let reviewApi: ReviewApi;
  let testProductId: string;
  let testReviewId: string;

  test.beforeAll(async ({ request }) => {
    reviewApi = new ReviewApi(request);
    const authApi = new AuthApi(request);
    const productApi = new ProductApi(request);

    const user = new UserBuilder().build();
    await authApi.register(user);
    const loginRes = await authApi.login(user.email, user.password);
    reviewApi.setToken((await loginRes.json()).access_token);

    const productsRes = await productApi.getProducts({ per_page: 1 });
    if (productsRes.ok()) {
      const data = await productsRes.json();
      if (data.items.length > 0) testProductId = data.items[0].id;
    }
  });

  test('POST /reviews - Should add review', async () => {
    if (!testProductId) test.skip();
    const response = await reviewApi.addReview({
      product_id: testProductId,
      rating: 5,
      comment: 'Excellent product!'
    });
    expect(response.status()).toBe(201);
    const data = await response.json();
    testReviewId = data.id;
  });

  test('POST /reviews - Should reject invalid rating', async () => {
    if (!testProductId) test.skip();
    const response = await reviewApi.addReview({
      product_id: testProductId,
      rating: 6, // Invalid
      comment: 'Too good!'
    });
    expect(response.status()).toBe(422);
  });

  test('GET /reviews/product/{id} - Should list reviews', async () => {
    if (!testProductId) test.skip();
    const response = await reviewApi.getProductReviews(testProductId);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('PUT /reviews/{id} - Should update review', async () => {
    if (!testReviewId) test.skip();
    const response = await reviewApi.updateReview(testReviewId, {
      rating: 4,
      comment: 'Good product!'
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.rating).toBe(4);
  });

  test('DELETE /reviews/{id} - Should delete review', async () => {
    if (!testReviewId) test.skip();
    const response = await reviewApi.deleteReview(testReviewId);
    expect(response.status()).toBe(200);
  });
});
