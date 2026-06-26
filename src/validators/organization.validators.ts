import { z } from 'zod';
import { ValidationSchemas } from '../shared/validation';
import { APP_CONSTANTS } from '../shared/constants';

const websiteSchema = z.string().url('Invalid website URL').max(255, 'Website URL is too long');

const subscriptionPlanSchema = z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']);
const subscriptionStatusSchema = z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED']);

export const createOrganizationSchema = z.object({
  name: ValidationSchemas.name,
  slug: ValidationSchemas.slug.optional(),
  email: ValidationSchemas.email,
  phone: ValidationSchemas.phone.optional(),
  website: websiteSchema.optional(),
  logo: z.string().url('Invalid logo URL').max(500, 'Logo URL is too long').optional(),
  address: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  timezone: z.string().min(1).max(64).optional(),
  currency: z.string().length(3, 'Currency must be ISO 4217 code').toUpperCase().optional(),
  subscriptionPlan: subscriptionPlanSchema.optional(),
  subscriptionStatus: subscriptionStatusSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  { message: 'At least one field is required for update' }
);

export const organizationParamsSchema = z.object({
  organizationId: ValidationSchemas.id,
});

export const listOrganizationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(APP_CONSTANTS.PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(APP_CONSTANTS.PAGINATION.MIN_LIMIT)
    .max(APP_CONSTANTS.PAGINATION.MAX_LIMIT)
    .default(APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT),
  sort: z.string().default(APP_CONSTANTS.PAGINATION.DEFAULT_SORT),
  order: z.enum(['asc', 'desc']).default(APP_CONSTANTS.PAGINATION.DEFAULT_ORDER),
  search: z.string().max(255).optional(),
  filters: z.string().optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type ListOrganizationsQuery = z.infer<typeof listOrganizationsQuerySchema>;
