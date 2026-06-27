import { z } from 'zod';

// Constants
export const MAINTENANCE_STATUSES = [
  'Open',
  'Assigned',
  'Scheduled',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled',
] as const;

export const MAINTENANCE_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Urgent',
  'Emergency',
] as const;

export const MAINTENANCE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Structural',
  'Cleaning',
  'Pest Control',
  'Other',
] as const;

// Base schemas
const uuidSchema = z.string().uuid('Invalid UUID format');
const positiveDecimalSchema = z.string().refine(
  (val) => {
    const num = Number(val);
    return !Number.isNaN(num) && num >= 0;
  },
  'Must be a non-negative number'
);

// Create Maintenance Request Schema
export const createMaintenanceSchema = z
  .object({
    propertyId: uuidSchema,
    unitId: uuidSchema.optional(),
    tenantId: uuidSchema.optional(),
    assignedTo: uuidSchema.optional(),
    requestNumber: z
      .string()
      .min(1, 'Request number is required')
      .max(100, 'Request number must be at most 100 characters'),
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be at most 200 characters'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(2000, 'Description must be at most 2000 characters'),
    category: z.enum(MAINTENANCE_CATEGORIES, {
      errorMap: () => ({ message: 'Invalid maintenance category' }),
    }),
    priority: z.enum(MAINTENANCE_PRIORITIES, {
      errorMap: () => ({ message: 'Invalid priority level' }),
    }),
    status: z.enum(MAINTENANCE_STATUSES, {
      errorMap: () => ({ message: 'Invalid maintenance status' }),
    }),
    requestedDate: z.string().datetime('Invalid date format'),
    scheduledDate: z.string().datetime('Invalid date format').optional(),
    estimatedCost: positiveDecimalSchema.optional(),
    vendor: z.string().max(200, 'Vendor must be at most 200 characters').optional(),
    notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
  })
  .strict();

// Update Maintenance Request Schema
export const updateMaintenanceSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be at most 200 characters')
      .optional(),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(2000, 'Description must be at most 2000 characters')
      .optional(),
    category: z.enum(MAINTENANCE_CATEGORIES, {
      errorMap: () => ({ message: 'Invalid maintenance category' }),
    }).optional(),
    priority: z.enum(MAINTENANCE_PRIORITIES, {
      errorMap: () => ({ message: 'Invalid priority level' }),
    }).optional(),
    status: z.enum(MAINTENANCE_STATUSES, {
      errorMap: () => ({ message: 'Invalid maintenance status' }),
    }).optional(),
    assignedTo: uuidSchema.optional(),
    scheduledDate: z.string().datetime('Invalid date format').optional(),
    startedDate: z.string().datetime('Invalid date format').optional(),
    completedDate: z.string().datetime('Invalid date format').optional(),
    estimatedCost: positiveDecimalSchema.optional(),
    actualCost: positiveDecimalSchema.optional(),
    vendor: z.string().max(200, 'Vendor must be at most 200 characters').optional(),
    notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
  })
  .strict();

// List Maintenance Requests Schema
export const listMaintenanceSchema = z
  .object({
    page: z.coerce.number().int().positive('Page must be a positive number').default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(MAINTENANCE_STATUSES).optional(),
    priority: z.enum(MAINTENANCE_PRIORITIES).optional(),
    category: z.enum(MAINTENANCE_CATEGORIES).optional(),
    propertyId: uuidSchema.optional(),
    unitId: uuidSchema.optional(),
    assignedTo: uuidSchema.optional(),
    startDate: z.string().datetime('Invalid date format').optional(),
    endDate: z.string().datetime('Invalid date format').optional(),
    search: z.string().optional(),
    sortBy: z.enum([
      'requestNumber',
      'title',
      'priority',
      'status',
      'requestedDate',
      'scheduledDate',
      'completedDate',
      'estimatedCost',
      'actualCost',
      'createdAt',
    ]).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  })
  .strict();

// Maintenance Request ID Parameter Schema
export const maintenanceIdParamSchema = z.object({
  maintenanceId: uuidSchema,
});

// Property ID Parameter Schema
export const propertyIdParamSchema = z.object({
  propertyId: uuidSchema,
});

// Assign Technician Schema
export const assignTechnicianSchema = z
  .object({
    assignedTo: uuidSchema,
  })
  .strict();

// Change Status Schema
export const changeStatusSchema = z
  .object({
    status: z.enum(MAINTENANCE_STATUSES, {
      errorMap: () => ({ message: 'Invalid maintenance status' }),
    }),
  })
  .strict();

// Add Notes Schema
export const addNotesSchema = z
  .object({
    notes: z
      .string()
      .min(1, 'Notes cannot be empty')
      .max(2000, 'Notes must be at most 2000 characters'),
  })
  .strict();

// Reopen Request Schema
export const reopenRequestSchema = z
  .object({
    status: z.literal('Open'),
  })
  .strict();

// Export types for use in services and controllers
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MaintenanceFilter {
  status?: string;
  priority?: string;
  category?: string;
  propertyId?: string;
  unitId?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export interface MaintenanceSearchOptions {
  query?: string;
}
