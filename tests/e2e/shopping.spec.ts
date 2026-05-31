import { test, expect } from '@playwright/test';
import { HomePage, ProductPage, CartPage } from '../pages';

test.describe('Shopping Flow', () => {
  test('Search and view product details', async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    
    await homePage.navigate();
    
    // Search for a product
    await homePage.searchProduct('Headphones');
    
    // Wait for results
    await page.waitForLoadState('networkidle');
    
    // Click first product card
    const firstProduct = page.locator('[data-testid^="product-card-"]').first();
    await firstProduct.click();
    
    // Verify product details
    await expect(productPage.title).toBeVisible();
    await expect(productPage.price).toBeVisible();
  });

  test('Add to cart from product page', async ({ page }) => {
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    
    // Navigate directly to a known product (using a dummy ID here, replace with real data setup in beforeAll)
    await productPage.navigate('1'); 
    
    // Increase quantity
    await productPage.increaseQuantity();
    
    // Add to cart
    await productPage.addToCart();
    
    // Go to cart
    await cartPage.navigate();
    
    // Verify item is in cart
    const cartItem = cartPage.getCartItem('1');
    await expect(cartItem).toBeVisible();
    
    // Proceed to checkout
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/\/checkout/);
  });
});
