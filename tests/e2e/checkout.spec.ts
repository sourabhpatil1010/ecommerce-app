import { test, expect } from '@playwright/test';
import { LoginPage, ProductPage, CartPage, CheckoutPage } from '../pages';

test.describe('Checkout Flow', () => {
  // Use a user specifically for checkout tests
  test.use({ storageState: 'tests/.auth/user.json' }); // Assuming auth state is saved

  test.skip('Complete checkout with simulated success', async ({ page }) => {
    // Skipping because it requires auth state and test data setup to run correctly
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    // 1. Add product to cart
    await productPage.navigate('1');
    await productPage.addToCart();
    
    // 2. Go to cart and proceed
    await cartPage.navigate();
    await cartPage.proceedToCheckout();
    
    // 3. Select existing address (assuming one exists)
    await checkoutPage.selectAddress('1');
    await checkoutPage.proceedToPayment();
    
    // 4. Select Stripe and simulate success
    await checkoutPage.selectPaymentMethod('stripe');
    await checkoutPage.simulateSuccessPayment();
    
    // 5. Verify order confirmation
    await expect(page).toHaveURL(/\/order\//);
    await expect(page.getByText(/Order Confirmed/i)).toBeVisible();
  });
});
