import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable().optional(),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const TokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string()
});
