import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages';

test.describe('Authentication', () => {
  test('Successful login and logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Navigate to login
    await loginPage.navigate();
    
    // Login with standard credentials (assuming test data)
    await loginPage.login('user@example.com', 'password123');
    
    // Wait for redirect to home
    await expect(page).toHaveURL('/');
    
    // Verify user profile menu is visible (indicating logged in state)
    const profileMenuBtn = page.getByTestId('header-profile-menu-btn');
    await expect(profileMenuBtn).toBeVisible();
    
    // Logout
    await profileMenuBtn.click();
    const logoutBtn = page.getByTestId('profile-menu-logout-btn');
    await logoutBtn.click();
    
    // Verify redirect to login or home with logged out state
    const loginLink = page.getByTestId('login-link');
    await expect(loginLink).toBeVisible();
  });

  test('Login failure with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    // Wait for error message (assuming react-hot-toast or error state)
    // Could check for specific text if needed.
    await expect(page.getByText(/Invalid/i)).toBeVisible();
  });
});
