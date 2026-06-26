import { z } from 'zod';
import { ValidationSchemas } from '../shared/validation';
import { APP_CONSTANTS } from '../shared/constants';

const websiteSchema = z.string().url('Invalid website URL').max(255, 'Website URL is too long');

const subscriptionPlanSchema = z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']);
const subscriptionStatusSchema = z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED']);

// Organization Settings Validators
const timezoneSchema = z.string()
  .min(1, 'Timezone is required')
  .max(64, 'Timezone is too long')
  .default('UTC');

const currencySchema = z.string()
  .length(3, 'Currency must be ISO 4217 code (e.g., USD, EUR, INR)')
  .toUpperCase()
  .default('USD');

const dateFormatSchema = z.enum(['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY']).default('YYYY-MM-DD');

const timeFormatSchema = z.enum(['HH:mm:ss', 'HH:mm', '12h']).default('HH:mm:ss');

const languageSchema = z.string().min(1).max(10).default('en');

const measurementUnitSchema = z.enum(['metric', 'imperial']).default('metric');

export const organizationSettingsSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required').max(64, 'Timezone is too long').optional(),
  currency: z.string().length(3, 'Currency must be ISO 4217 code (e.g., USD, EUR, INR)').toUpperCase().optional(),
  dateFormat: z.enum(['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY']).optional(),
  timeFormat: z.enum(['HH:mm:ss', 'HH:mm', '12h']).optional(),
  language: z.string().min(1).max(10).optional(),
  measurementUnit: z.enum(['metric', 'imperial']).optional(),
});

// Organization Branding Validators
const colorSchema = z.string()
  .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format. Use hex format (e.g., #000000)');

const themeSchema = z.enum(['light', 'dark']).default('light');

export const organizationBrandingSchema = z.object({
  logoUrl: z.string().url('Invalid logo URL').optional().nullable(),
  logoAltText: z.string().max(255, 'Logo alt text is too long').optional(),
  faviconUrl: z.string().url('Invalid favicon URL').optional().nullable(),
  primaryColor: colorSchema.optional(),
  secondaryColor: colorSchema.optional(),
  accentColor: colorSchema.optional(),
  theme: z.enum(['light', 'dark']).optional(),
  customCss: z.string().max(5000, 'Custom CSS is too long').optional().nullable(),
});

// Organization Preferences Validators
const emailDigestSchema = z.enum(['off', 'daily', 'weekly', 'monthly']).default('daily');
const backupFrequencySchema = z.enum(['daily', 'weekly', 'monthly']).default('weekly');

export const organizationPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  emailDigest: emailDigestSchema.optional(),
  twoFactorAuth: z.boolean().optional(),
  dataRetention: z.number().int().min(1).max(3650).optional(),
  backupFrequency: backupFrequencySchema.optional(),
});

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
  timezone: timezoneSchema.optional(),
  currency: currencySchema.optional(),
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
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
export type OrganizationBrandingInput = z.infer<typeof organizationBrandingSchema>;
export type OrganizationPreferencesInput = z.infer<typeof organizationPreferencesSchema>;
