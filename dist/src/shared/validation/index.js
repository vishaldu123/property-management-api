"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationSchemas = void 0;
exports.validate = validate;
exports.validateOrThrow = validateOrThrow;
const zod_1 = require("zod");
const constants_1 = require("../constants");
/**
 * Centralized Zod Validation Schemas
 */
exports.ValidationSchemas = {
    /**
     * Common field validators
     */
    id: zod_1.z.string().uuid('Must be a valid UUID'),
    email: zod_1.z
        .string()
        .email('Must be a valid email address')
        .min(constants_1.APP_CONSTANTS.LENGTHS.EMAIL_MIN)
        .max(constants_1.APP_CONSTANTS.LENGTHS.EMAIL_MAX),
    password: zod_1.z
        .string()
        .min(constants_1.APP_CONSTANTS.LENGTHS.PASSWORD_MIN)
        .max(constants_1.APP_CONSTANTS.LENGTHS.PASSWORD_MAX)
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[a-z]/, 'Must contain lowercase letter')
        .regex(/[0-9]/, 'Must contain number')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain special character'),
    phone: zod_1.z
        .string()
        .min(constants_1.APP_CONSTANTS.LENGTHS.PHONE_MIN)
        .max(constants_1.APP_CONSTANTS.LENGTHS.PHONE_MAX)
        .regex(/^\d+$/, 'Must contain only digits'),
    name: zod_1.z
        .string()
        .min(constants_1.APP_CONSTANTS.LENGTHS.NAME_MIN)
        .max(constants_1.APP_CONSTANTS.LENGTHS.NAME_MAX),
    slug: zod_1.z
        .string()
        .min(constants_1.APP_CONSTANTS.LENGTHS.SLUG_MIN)
        .max(constants_1.APP_CONSTANTS.LENGTHS.SLUG_MAX)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
    description: zod_1.z
        .string()
        .min(constants_1.APP_CONSTANTS.LENGTHS.DESCRIPTION_MIN)
        .max(constants_1.APP_CONSTANTS.LENGTHS.DESCRIPTION_MAX)
        .optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
    role: zod_1.z.enum(['OWNER', 'ADMIN', 'STAFF', 'ACCOUNTANT', 'TENANT']).optional(),
    /**
     * Pagination validators
     */
    page: zod_1.z.number().int().positive('Page must be positive'),
    limit: zod_1.z
        .number()
        .int()
        .min(constants_1.APP_CONSTANTS.PAGINATION.MIN_LIMIT)
        .max(constants_1.APP_CONSTANTS.PAGINATION.MAX_LIMIT),
    sort: zod_1.z.string().optional(),
    order: zod_1.z.enum(['asc', 'desc']).optional(),
    search: zod_1.z.string().max(255).optional(),
    /**
     * Date validators
     */
    date: zod_1.z.date().or(zod_1.z.string().datetime()),
    dateRange: zod_1.z.object({
        from: zod_1.z.date().or(zod_1.z.string().datetime()),
        to: zod_1.z.date().or(zod_1.z.string().datetime()),
    }),
    /**
     * Boolean validators
     */
    active: zod_1.z.boolean().optional(),
    /**
     * Array validators
     */
    ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
};
/**
 * Validate data against schema
 */
function validate(data, schema) {
    try {
        const result = schema.parse(data);
        return { success: true, data: result };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = {};
            error.issues.forEach((err) => {
                const path = err.path.join('.');
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(err.message);
            });
            return { success: false, errors };
        }
        return { success: false, errors: { general: ['Validation failed'] } };
    }
}
/**
 * Throw validation error helper
 */
function validateOrThrow(data, schema) {
    const result = validate(data, schema);
    if (!result.success) {
        throw new Error(JSON.stringify(result.errors));
    }
    return result.data;
}
