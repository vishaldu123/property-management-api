import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional().nullable(),
});