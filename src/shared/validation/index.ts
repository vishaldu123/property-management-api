import { z } from 'zod';
import { APP_CONSTANTS } from '../constants';

/**
 * Centralized Zod Validation Schemas
 */

export const ValidationSchemas = {
  /**
   * Common field validators
   */
  id: z.string().uuid('Must be a valid UUID'),
  email: z
    .string()
    .email('Must be a valid email address')
    .min(APP_CONSTANTS.LENGTHS.EMAIL_MIN)
    .max(APP_CONSTANTS.LENGTHS.EMAIL_MAX),
  password: z
    .string()
    .min(APP_CONSTANTS.LENGTHS.PASSWORD_MIN)
    .max(APP_CONSTANTS.LENGTHS.PASSWORD_MAX)
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain special character'),
  phone: z
    .string()
    .min(APP_CONSTANTS.LENGTHS.PHONE_MIN)
    .max(APP_CONSTANTS.LENGTHS.PHONE_MAX)
    .regex(/^\d+$/, 'Must contain only digits'),
  name: z
    .string()
    .min(APP_CONSTANTS.LENGTHS.NAME_MIN)
    .max(APP_CONSTANTS.LENGTHS.NAME_MAX),
  slug: z
    .string()
    .min(APP_CONSTANTS.LENGTHS.SLUG_MIN)
    .max(APP_CONSTANTS.LENGTHS.SLUG_MAX)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  description: z
    .string()
    .min(APP_CONSTANTS.LENGTHS.DESCRIPTION_MIN)
    .max(APP_CONSTANTS.LENGTHS.DESCRIPTION_MAX)
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
  role: z.enum(['OWNER', 'ADMIN', 'STAFF', 'ACCOUNTANT', 'TENANT']).optional(),

  /**
   * Pagination validators
   */
  page: z.number().int().positive('Page must be positive'),
  limit: z
    .number()
    .int()
    .min(APP_CONSTANTS.PAGINATION.MIN_LIMIT)
    .max(APP_CONSTANTS.PAGINATION.MAX_LIMIT),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().max(255).optional(),

  /**
   * Date validators
   */
  date: z.date().or(z.string().datetime()),
  dateRange: z.object({
    from: z.date().or(z.string().datetime()),
    to: z.date().or(z.string().datetime()),
  }),

  /**
   * Boolean validators
   */
  active: z.boolean().optional(),

  /**
   * Array validators
   */
  ids: z.array(z.string().uuid()).min(1),
  tags: z.array(z.string()).optional(),
};

/**
 * Validate data against schema
 */
export function validate<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; errors?: Record<string, string[]> } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      (error as any).issues.forEach((err: z.ZodIssue) => {
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
export function validateOrThrow<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  const result = validate(data, schema);
  if (!result.success) {
    throw new Error(JSON.stringify(result.errors));
  }
  return result.data!;
}
