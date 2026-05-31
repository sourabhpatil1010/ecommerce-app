import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly proceedToCheckoutBtn: Locator;
  readonly continueShoppingBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.proceedToCheckoutBtn = this.getLocatorByTestId('proceed-to-checkout-btn');
    this.continueShoppingBtn = this.getLocatorByTestId('continue-shopping-btn');
  }

  async navigate() {
    await this.page.goto('/cart');
    await this.waitForLoadState();
  }

  getCartItem(itemId: string): Locator {
    return this.getLocatorByTestId(`cart-item-${itemId}`);
  }

  async removeCartItem(itemId: string) {
    const removeBtn = this.getLocatorByTestId(`remove-cart-item-${itemId}`);
    await removeBtn.click();
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutBtn.click();
  }
}
