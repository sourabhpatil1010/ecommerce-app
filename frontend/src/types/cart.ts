import type { Product } from "./product";

/** Cart entity. */
export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
}

/** Individual line item within a cart. */
export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product: Product;
}
