import { test, expect } from '@playwright/test';
import { AuthApi } from '../client';
import { UserBuilder } from '../data/UserBuilder';
import { TokenSchema, UserSchema } from '../schemas/UserSchema';

test.describe('Auth API Testing', () => {
  let authApi: AuthApi;
  const testUser = new UserBuilder().build();

  test.beforeAll(async ({ request }) => {
    authApi = new AuthApi(request);
  });

  test('POST /register - Should register a new user successfully', async () => {
    const response = await authApi.register(testUser);
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    // Validate schema
    expect(() => UserSchema.parse(data)).not.toThrow();
    expect(data.email).toBe(testUser.email);
  });

  test('POST /register - Should fail with duplicate email', async () => {
    const response = await authApi.register(testUser);
    expect(response.status()).toBe(400); // Usually 400 Bad Request for duplicate
    const data = await response.json();
    expect(data.detail).toContain('Email already registered');
  });

  test('POST /register - Should fail with empty fields', async () => {
    const response = await authApi.register({ email: '', password: '' });
    expect(response.status()).toBe(422); // Validation error
  });

  test('POST /login - Should login with valid credentials', async () => {
    const response = await authApi.login(testUser.email, testUser.password);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(() => TokenSchema.parse(data)).not.toThrow();
    expect(data.access_token).toBeDefined();
    expect(data.token_type).toBe('bearer');
  });

  test('POST /login - Should fail with invalid password', async () => {
    const response = await authApi.login(testUser.email, 'wrongpassword');
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.detail).toContain('Incorrect email or password');
  });

  test('POST /login - Should fail with non-existent email', async () => {
    const response = await authApi.login('doesnotexist@example.com', 'password123');
    expect(response.status()).toBe(401);
  });

  test('GET /me - Should get current user details', async () => {
    // 1. Login to get token
    const loginRes = await authApi.login(testUser.email, testUser.password);
    const { access_token } = await loginRes.json();
    
    // 2. Set token and fetch /me
    authApi.setToken(access_token);
    const meRes = await authApi.getMe();
    expect(meRes.status()).toBe(200);
    
    const meData = await meRes.json();
    expect(() => UserSchema.parse(meData)).not.toThrow();
    expect(meData.email).toBe(testUser.email);
  });

  test('GET /me - Should fail with missing or invalid token', async () => {
    authApi.setToken(''); // Clear token
    const response = await authApi.getMe();
    expect(response.status()).toBe(401);
    
    authApi.setToken('invalid.token.string');
    const response2 = await authApi.getMe();
    expect(response2.status()).toBe(401);
  });
});
