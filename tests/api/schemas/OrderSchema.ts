import { z } from 'zod';

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  quantity: z.number(),
  unit_price: z.number(),
  subtotal: z.number()
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: z.string(),
  payment_status: z.string(),
  payment_method: z.string(),
  subtotal: z.number(),
  shipping_fee: z.number(),
  tax: z.number(),
  discount: z.number(),
  total_amount: z.number(),
  shipping_address_id: z.string().uuid().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  items: z.array(OrderItemSchema).optional()
});
