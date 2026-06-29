"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reopenRequestSchema = exports.addNotesSchema = exports.changeStatusSchema = exports.assignTechnicianSchema = exports.propertyIdParamSchema = exports.maintenanceIdParamSchema = exports.listMaintenanceSchema = exports.updateMaintenanceSchema = exports.createMaintenanceSchema = exports.MAINTENANCE_CATEGORIES = exports.MAINTENANCE_PRIORITIES = exports.MAINTENANCE_STATUSES = void 0;
const zod_1 = require("zod");
// Constants
exports.MAINTENANCE_STATUSES = [
    'Open',
    'Assigned',
    'Scheduled',
    'In Progress',
    'On Hold',
    'Completed',
    'Cancelled',
];
exports.MAINTENANCE_PRIORITIES = [
    'Low',
    'Medium',
    'High',
    'Urgent',
    'Emergency',
];
exports.MAINTENANCE_CATEGORIES = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Structural',
    'Cleaning',
    'Pest Control',
    'Other',
];
// Base schemas
const uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
const positiveDecimalSchema = zod_1.z.string().refine((val) => {
    const num = Number(val);
    return !Number.isNaN(num) && num >= 0;
}, 'Must be a non-negative number');
// Create Maintenance Request Schema
exports.createMaintenanceSchema = zod_1.z
    .object({
    propertyId: uuidSchema,
    unitId: uuidSchema.optional(),
    tenantId: uuidSchema.optional(),
    assignedTo: uuidSchema.optional(),
    requestNumber: zod_1.z
        .string()
        .min(1, 'Request number is required')
        .max(100, 'Request number must be at most 100 characters'),
    title: zod_1.z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be at most 200 characters'),
    description: zod_1.z
        .string()
        .min(1, 'Description is required')
        .max(2000, 'Description must be at most 2000 characters'),
    category: zod_1.z.enum(exports.MAINTENANCE_CATEGORIES, { message: 'Invalid maintenance category' }),
    priority: zod_1.z.enum(exports.MAINTENANCE_PRIORITIES, { message: 'Invalid priority level' }),
    status: zod_1.z.enum(exports.MAINTENANCE_STATUSES, { message: 'Invalid maintenance status' }),
    requestedDate: zod_1.z.string().datetime('Invalid date format'),
    scheduledDate: zod_1.z.string().datetime('Invalid date format').optional(),
    estimatedCost: positiveDecimalSchema.optional(),
    vendor: zod_1.z.string().max(200, 'Vendor must be at most 200 characters').optional(),
    notes: zod_1.z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
})
    .strict();
// Update Maintenance Request Schema
exports.updateMaintenanceSchema = zod_1.z
    .object({
    title: zod_1.z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be at most 200 characters')
        .optional(),
    description: zod_1.z
        .string()
        .min(1, 'Description is required')
        .max(2000, 'Description must be at most 2000 characters')
        .optional(),
    category: zod_1.z
        .enum(exports.MAINTENANCE_CATEGORIES, { message: 'Invalid maintenance category' })
        .optional(),
    priority: zod_1.z
        .enum(exports.MAINTENANCE_PRIORITIES, { message: 'Invalid priority level' })
        .optional(),
    status: zod_1.z
        .enum(exports.MAINTENANCE_STATUSES, { message: 'Invalid maintenance status' })
        .optional(),
    assignedTo: uuidSchema.optional(),
    scheduledDate: zod_1.z.string().datetime('Invalid date format').optional(),
    startedDate: zod_1.z.string().datetime('Invalid date format').optional(),
    completedDate: zod_1.z.string().datetime('Invalid date format').optional(),
    estimatedCost: positiveDecimalSchema.optional(),
    actualCost: positiveDecimalSchema.optional(),
    vendor: zod_1.z.string().max(200, 'Vendor must be at most 200 characters').optional(),
    notes: zod_1.z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
})
    .strict();
// List Maintenance Requests Schema
exports.listMaintenanceSchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().positive('Page must be a positive number').default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.enum(exports.MAINTENANCE_STATUSES).optional(),
    priority: zod_1.z.enum(exports.MAINTENANCE_PRIORITIES).optional(),
    category: zod_1.z.enum(exports.MAINTENANCE_CATEGORIES).optional(),
    propertyId: uuidSchema.optional(),
    unitId: uuidSchema.optional(),
    assignedTo: uuidSchema.optional(),
    startDate: zod_1.z.string().datetime('Invalid date format').optional(),
    endDate: zod_1.z.string().datetime('Invalid date format').optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum([
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
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
})
    .strict();
// Maintenance Request ID Parameter Schema
exports.maintenanceIdParamSchema = zod_1.z.object({
    maintenanceId: uuidSchema,
});
// Property ID Parameter Schema
exports.propertyIdParamSchema = zod_1.z.object({
    propertyId: uuidSchema,
});
// Assign Technician Schema
exports.assignTechnicianSchema = zod_1.z
    .object({
    assignedTo: uuidSchema,
})
    .strict();
// Change Status Schema
exports.changeStatusSchema = zod_1.z
    .object({
    status: zod_1.z.enum(exports.MAINTENANCE_STATUSES, { message: 'Invalid maintenance status' }),
})
    .strict();
// Add Notes Schema
exports.addNotesSchema = zod_1.z
    .object({
    notes: zod_1.z
        .string()
        .min(1, 'Notes cannot be empty')
        .max(2000, 'Notes must be at most 2000 characters'),
})
    .strict();
// Reopen Request Schema
exports.reopenRequestSchema = zod_1.z
    .object({
    status: zod_1.z.literal('Open'),
})
    .strict();
