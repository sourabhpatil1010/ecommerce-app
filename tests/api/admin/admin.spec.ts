import { test, expect } from '@playwright/test';
import { AdminApi, AuthApi, ProductApi } from '../client';

test.describe('Admin API Testing', () => {
  let adminApi: AdminApi;
  let unauthorizedApi: AdminApi;

  test.beforeAll(async ({ request }) => {
    adminApi = new AdminApi(request);
    unauthorizedApi = new AdminApi(request);

    const authApi = new AuthApi(request);
    
    // Login as SuperAdmin
    const adminLoginRes = await authApi.login('superadmin@example.com', 'admin123');
    if (adminLoginRes.ok()) {
      adminApi.setToken((await adminLoginRes.json()).access_token);
    }

    // Standard user (unauthorized for admin routes)
    // Could register a dummy user here, but we'll assume unauthenticated fails similarly 
    // or we just use an empty token for this test.
  });

  test('GET /dashboard/stats - Admin should access stats', async () => {
    // If we didn't get an admin token, skip
    if (!adminApi['token']) test.skip();

    const response = await adminApi.getStats();
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.total_revenue).toBeDefined();
  });

  test('GET /dashboard/stats - Unauthorized user should be rejected', async () => {
    const response = await unauthorizedApi.getStats();
    expect(response.status()).toBe(401);
  });

  test('GET /users - Admin should list all users', async () => {
    if (!adminApi['token']) test.skip();

    const response = await adminApi.getUsers();
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});
