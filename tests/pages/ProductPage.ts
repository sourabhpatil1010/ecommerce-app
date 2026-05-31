import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly title: Locator;
  readonly price: Locator;
  readonly qtyInput: Locator;
  readonly increaseQtyBtn: Locator;
  readonly decreaseQtyBtn: Locator;
  readonly addToCartBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.title = this.getLocatorByTestId('product-detail-title');
    this.price = this.getLocatorByTestId('product-detail-price');
    this.qtyInput = this.getLocatorByTestId('qty-input');
    this.increaseQtyBtn = this.getLocatorByTestId('qty-increase-btn');
    this.decreaseQtyBtn = this.getLocatorByTestId('qty-decrease-btn');
    this.addToCartBtn = this.getLocatorByTestId('add-to-cart-detail-btn');
  }

  async navigate(productId: string) {
    await this.page.goto(`/product/${productId}`);
    await this.waitForLoadState();
  }

  async setQuantity(qty: number) {
    await this.qtyInput.fill(qty.toString());
  }

  async increaseQuantity() {
    await this.increaseQtyBtn.click();
  }

  async decreaseQuantity() {
    await this.decreaseQtyBtn.click();
  }

  async addToCart() {
    await this.addToCartBtn.click();
  }
}
