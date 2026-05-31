import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.getLocatorByTestId('email-input');
    this.passwordInput = this.getLocatorByTestId('password-input');
    this.loginButton = this.getLocatorByTestId('login-submit-btn');
  }

  async navigate() {
    await this.page.goto('/login');
    await this.waitForLoadState();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
