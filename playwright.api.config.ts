import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Configure target environment
 */
const ENV = process.env.TEST_ENV || 'local';

const getBaseUrl = () => {
  switch (ENV) {
    case 'qa':
      return 'https://qa-api.example.com/api/v1';
    case 'staging':
      return 'https://staging-api.example.com/api/v1';
    case 'local':
    default:
      return process.env.API_BASE_URL || 'http://localhost:8000/api/v1';
  }
};

export default defineConfig({
  testDir: './tests/api',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    baseURL: getBaseUrl(),
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
