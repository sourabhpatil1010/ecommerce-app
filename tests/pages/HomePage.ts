import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly heroShopNowButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heroShopNowButton = this.getLocatorByTestId('hero-shop-now-btn');
    this.searchInput = this.getLocatorByTestId('header-search-input');
    this.searchButton = this.getLocatorByTestId('header-search-btn');
    this.cartLink = this.getLocatorByTestId('header-cart-link');
  }

  async navigate() {
    await this.page.goto('/');
    await this.waitForLoadState();
  }

  async searchProduct(productName: string) {
    await this.searchButton.click();
    await this.searchInput.fill(productName);
    await this.searchInput.press('Enter');
  }

  getProductCard(productId: string): Locator {
    return this.getLocatorByTestId(`product-card-${productId}`);
  }

  async addProductToCart(productId: string) {
    const btn = this.getLocatorByTestId(`add-to-cart-${productId}`);
    await btn.click();
  }
}
