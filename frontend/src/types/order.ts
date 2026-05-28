/** Order entity returned from the API. */
export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string | null;
  department: string | null;
  tracking_id: string | null;
  courier: string | null;
  items: OrderItem[];
  status_history?: OrderStatusHistory[];
  payment_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Individual line item within an order. */
export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}
