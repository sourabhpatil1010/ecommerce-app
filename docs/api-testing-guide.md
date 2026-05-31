# API Testing Guide

This guide covers the usage of the Playwright API Automation Framework built for the E-Commerce application.

## Framework Structure

- `tests/api/client/`: Reusable, typed API classes wrapping `APIRequestContext`.
- `tests/api/data/`: Data builders using `@faker-js/faker` to generate dynamic test payloads.
- `tests/api/schemas/`: Zod schemas for validating API response structures.
- `tests/api/<domain>/`: Categorized test suites (e.g., `auth/`, `products/`).
- `playwright.api.config.ts`: The dedicated configuration file for running API tests.

## Running Tests

To run the API tests, use the specific configuration file:

```bash
# Run all API tests
npx playwright test -c playwright.api.config.ts

# Run a specific suite
npx playwright test tests/api/auth -c playwright.api.config.ts

# Run against a specific environment (local is default)
TEST_ENV=qa npx playwright test -c playwright.api.config.ts
```

## Example: Auth Endpoint

### API Details
- **Endpoint**: `/api/v1/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request (Form Data)**:
  ```json
  {
    "username": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbG...",
    "token_type": "bearer"
  }
  ```

### Playwright Implementation Example

```typescript
import { test, expect } from '@playwright/test';
import { AuthApi } from '../client';
import { TokenSchema } from '../schemas/UserSchema';

test('Login Test', async ({ request }) => {
  const authApi = new AuthApi(request);
  
  // 1. Make the request via Client
  const response = await authApi.login('user@example.com', 'password123');
  
  // 2. Validate Status
  expect(response.status()).toBe(200);
  
  // 3. Validate Schema
  const data = await response.json();
  expect(() => TokenSchema.parse(data)).not.toThrow();
});
```

## Creating Test Data

Always use the Builder classes in `tests/api/data/` for creating realistic payloads to avoid hardcoded dependencies.

```typescript
import { ProductBuilder } from '../data/ProductBuilder';

const newProduct = new ProductBuilder()
  .withPrice(49.99)
  .withStock(100)
  .build();
```
