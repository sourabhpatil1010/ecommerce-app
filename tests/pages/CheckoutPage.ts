import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly addNewAddressBtn: Locator;
  readonly continuePaymentBtn: Locator;
  
  // Payment Simulator
  readonly paymentMethodStripe: Locator;
  readonly paymentMethodRazorpay: Locator;
  readonly paymentMethodCod: Locator;
  
  readonly simulateSuccessBtn: Locator;
  readonly simulateFailureBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.addNewAddressBtn = this.getLocatorByTestId('add-new-address-btn');
    this.continuePaymentBtn = this.getLocatorByTestId('continue-payment-btn');
    
    this.paymentMethodStripe = this.getLocatorByTestId('payment-method-stripe');
    this.paymentMethodRazorpay = this.getLocatorByTestId('payment-method-razorpay');
    this.paymentMethodCod = this.getLocatorByTestId('payment-method-cod');
    
    this.simulateSuccessBtn = this.getLocatorByTestId('simulate-success-btn');
    this.simulateFailureBtn = this.getLocatorByTestId('simulate-failure-btn');
  }

  async navigate() {
    await this.page.goto('/checkout');
    await this.waitForLoadState();
  }

  async selectAddress(addressId: string) {
    // Assuming clicking the address card selects it
    const addressCard = this.getLocatorByTestId(`address-card-${addressId}`);
    await addressCard.click();
  }

  async proceedToPayment() {
    await this.continuePaymentBtn.click();
  }

  async selectPaymentMethod(method: 'stripe' | 'razorpay' | 'cod') {
    if (method === 'stripe') await this.paymentMethodStripe.click();
    if (method === 'razorpay') await this.paymentMethodRazorpay.click();
    if (method === 'cod') await this.paymentMethodCod.click();
  }

  async simulateSuccessPayment() {
    await this.simulateSuccessBtn.click();
  }
}
