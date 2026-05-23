/** Cart entity. */
export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
}

/** Individual line item within a cart. */
export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}
