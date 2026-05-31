import { faker } from '@faker-js/faker';

export class UserBuilder {
  private data: Record<string, any>;

  constructor() {
    this.data = {
      email: faker.internet.email().toLowerCase(),
      password: 'TestPassword123!',
      full_name: faker.person.fullName(),
    };
  }

  withEmail(email: string) {
    this.data.email = email;
    return this;
  }

  withPassword(password: string) {
    this.data.password = password;
    return this;
  }

  withFullName(name: string) {
    this.data.full_name = name;
    return this;
  }

  build() {
    return { ...this.data };
  }
}
