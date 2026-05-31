import { faker } from '@faker-js/faker';

export class AddressBuilder {
  private data: Record<string, any>;

  constructor() {
    this.data = {
      full_name: faker.person.fullName(),
      phone: faker.phone.number({ style: 'national' }).replace(/\D/g, '').substring(0, 10),
      pincode: faker.location.zipCode('######'),
      locality: faker.location.streetAddress(),
      address_line: faker.location.secondaryAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      landmark: faker.location.street(),
      alternate_phone: '',
      address_type: 'HOME',
      is_default: false
    };
  }

  isDefault() {
    this.data.is_default = true;
    return this;
  }

  asWork() {
    this.data.address_type = 'WORK';
    return this;
  }

  build() {
    return { ...this.data };
  }
}
