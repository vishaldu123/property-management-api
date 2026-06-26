"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrganizationsQuerySchema = exports.organizationParamsSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../shared/validation");
const constants_1 = require("../shared/constants");
const websiteSchema = zod_1.z.string().url('Invalid website URL').max(255, 'Website URL is too long');
const subscriptionPlanSchema = zod_1.z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']);
const subscriptionStatusSchema = zod_1.z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED']);
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
    timezone: zod_1.z.string().min(1).max(64).optional(),
    currency: zod_1.z.string().length(3, 'Currency must be ISO 4217 code').toUpperCase().optional(),
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
