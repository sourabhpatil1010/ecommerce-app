import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Helper method to wait for the page to be fully loaded
   */
  async waitForLoadState() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Helper to get an element by its test id.
   */
  getLocatorByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }
}
