import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  stock: z.number(),
  is_active: z.boolean(),
  category_id: z.string().uuid().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export const ProductListSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
  pages: z.number()
});
