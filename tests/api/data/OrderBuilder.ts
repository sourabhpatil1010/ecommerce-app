import { faker } from '@faker-js/faker';

export class OrderBuilder {
  private data: Record<string, any>;

  constructor() {
    this.data = {
      address_id: '',
      payment_method: 'COD'
    };
  }

  withAddress(addressId: string) {
    this.data.address_id = addressId;
    return this;
  }

  withPaymentMethod(method: 'COD' | 'RAZORPAY' | 'STRIPE') {
    this.data.payment_method = method;
    return this;
  }

  build() {
    return { ...this.data };
  }
}
