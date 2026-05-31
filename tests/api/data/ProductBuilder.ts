import { faker } from '@faker-js/faker';

export class ProductBuilder {
  private data: Record<string, any>;

  constructor() {
    this.data = {
      name: faker.commerce.productName() + ' ' + faker.string.uuid().substring(0, 5),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      stock: faker.number.int({ min: 10, max: 100 }),
      category_id: null,
      is_active: true,
      image_url: faker.image.url()
    };
  }

  withCategory(categoryId: string) {
    this.data.category_id = categoryId;
    return this;
  }

  withStock(stock: number) {
    this.data.stock = stock;
    return this;
  }

  withPrice(price: number) {
    this.data.price = price;
    return this;
  }

  inactive() {
    this.data.is_active = false;
    return this;
  }

  build() {
    return { ...this.data };
  }
}
