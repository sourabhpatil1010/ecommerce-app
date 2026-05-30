/** Product image associated with a product. */
export interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

/** Product entity returned from the API. */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
}
