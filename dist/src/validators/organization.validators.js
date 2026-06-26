"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrganizationsQuerySchema = exports.organizationParamsSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = exports.organizationPreferencesSchema = exports.organizationBrandingSchema = exports.organizationSettingsSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../shared/validation");
const constants_1 = require("../shared/constants");
const websiteSchema = zod_1.z.string().url('Invalid website URL').max(255, 'Website URL is too long');
const subscriptionPlanSchema = zod_1.z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']);
const subscriptionStatusSchema = zod_1.z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED']);
// Organization Settings Validators
const timezoneSchema = zod_1.z.string()
    .min(1, 'Timezone is required')
    .max(64, 'Timezone is too long')
    .default('UTC');
const currencySchema = zod_1.z.string()
    .length(3, 'Currency must be ISO 4217 code (e.g., USD, EUR, INR)')
    .toUpperCase()
    .default('USD');
const dateFormatSchema = zod_1.z.enum(['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY']).default('YYYY-MM-DD');
const timeFormatSchema = zod_1.z.enum(['HH:mm:ss', 'HH:mm', '12h']).default('HH:mm:ss');
const languageSchema = zod_1.z.string().min(1).max(10).default('en');
const measurementUnitSchema = zod_1.z.enum(['metric', 'imperial']).default('metric');
exports.organizationSettingsSchema = zod_1.z.object({
    timezone: zod_1.z.string().min(1, 'Timezone is required').max(64, 'Timezone is too long').optional(),
    currency: zod_1.z.string().length(3, 'Currency must be ISO 4217 code (e.g., USD, EUR, INR)').toUpperCase().optional(),
    dateFormat: zod_1.z.enum(['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY']).optional(),
    timeFormat: zod_1.z.enum(['HH:mm:ss', 'HH:mm', '12h']).optional(),
    language: zod_1.z.string().min(1).max(10).optional(),
    measurementUnit: zod_1.z.enum(['metric', 'imperial']).optional(),
});
// Organization Branding Validators
const colorSchema = zod_1.z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format. Use hex format (e.g., #000000)');
const themeSchema = zod_1.z.enum(['light', 'dark']).default('light');
exports.organizationBrandingSchema = zod_1.z.object({
    logoUrl: zod_1.z.string().url('Invalid logo URL').optional().nullable(),
    logoAltText: zod_1.z.string().max(255, 'Logo alt text is too long').optional(),
    faviconUrl: zod_1.z.string().url('Invalid favicon URL').optional().nullable(),
    primaryColor: colorSchema.optional(),
    secondaryColor: colorSchema.optional(),
    accentColor: colorSchema.optional(),
    theme: zod_1.z.enum(['light', 'dark']).optional(),
    customCss: zod_1.z.string().max(5000, 'Custom CSS is too long').optional().nullable(),
});
// Organization Preferences Validators
const emailDigestSchema = zod_1.z.enum(['off', 'daily', 'weekly', 'monthly']).default('daily');
const backupFrequencySchema = zod_1.z.enum(['daily', 'weekly', 'monthly']).default('weekly');
exports.organizationPreferencesSchema = zod_1.z.object({
    emailNotifications: zod_1.z.boolean().optional(),
    emailDigest: emailDigestSchema.optional(),
    twoFactorAuth: zod_1.z.boolean().optional(),
    dataRetention: zod_1.z.number().int().min(1).max(3650).optional(),
    backupFrequency: backupFrequencySchema.optional(),
});
exports.createOrganizationSchema = zod_1.z.object({
    name: validation_1.ValidationSchemas.name,
    slug: validation_1.ValidationSchemas.slug.optional(),
    email: validation_1.ValidationSchemas.email,
    phone: validation_1.ValidationSchemas.phone.optional(),
    website: websiteSchema.optional(),
    logo: zod_1.z.string().url('Invalid logo URL').max(500, 'Logo URL is too long').optional(),
    address: zod_1.z.string().min(1).max(255).optional(),
    city: zod_1.z.string().min(1).max(100).optional(),
    state: zod_1.z.string().min(1).max(100).optional(),
    country: zod_1.z.string().min(1).max(100).optional(),
    postalCode: zod_1.z.string().min(1).max(20).optional(),
    timezone: timezoneSchema.optional(),
    currency: currencySchema.optional(),
    subscriptionPlan: subscriptionPlanSchema.optional(),
    subscriptionStatus: subscriptionStatusSchema.optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateOrganizationSchema = exports.createOrganizationSchema.partial().refine((payload) => Object.keys(payload).length > 0, { message: 'At least one field is required for update' });
exports.organizationParamsSchema = zod_1.z.object({
    organizationId: validation_1.ValidationSchemas.id,
});
exports.listOrganizationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(constants_1.APP_CONSTANTS.PAGINATION.DEFAULT_PAGE),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(constants_1.APP_CONSTANTS.PAGINATION.MIN_LIMIT)
        .max(constants_1.APP_CONSTANTS.PAGINATION.MAX_LIMIT)
        .default(constants_1.APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT),
    sort: zod_1.z.string().default(constants_1.APP_CONSTANTS.PAGINATION.DEFAULT_SORT),
    order: zod_1.z.enum(['asc', 'desc']).default(constants_1.APP_CONSTANTS.PAGINATION.DEFAULT_ORDER),
    search: zod_1.z.string().max(255).optional(),
    filters: zod_1.z.string().optional(),
    includeDeleted: zod_1.z.coerce.boolean().default(false),
});
