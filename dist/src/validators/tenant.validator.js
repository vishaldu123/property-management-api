"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantIdSchema = exports.listTenantsSchema = exports.updateTenantSchema = exports.createTenantSchema = exports.TENANT_STATUSES = void 0;
const zod_1 = require("zod");
// Tenant status constants
exports.TENANT_STATUSES = ['Prospect', 'Active', 'Notice', 'Former', 'Blacklisted'];
// Base tenant schema object
const baseTenantSchema = {
    firstName: zod_1.z.string().min(1, 'First name is required').max(100),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().max(20).optional(),
    dateOfBirth: zod_1.z.string().datetime().optional(),
    governmentIdType: zod_1.z.string().max(50).optional(),
    governmentIdNumber: zod_1.z.string().max(50).optional(),
    emergencyContactName: zod_1.z.string().max(100).optional(),
    emergencyContactPhone: zod_1.z.string().max(20).optional(),
    occupation: zod_1.z.string().max(100).optional(),
    employer: zod_1.z.string().max(100).optional(),
    status: zod_1.z.enum(exports.TENANT_STATUSES, {
        message: `Status must be one of: ${exports.TENANT_STATUSES.join(', ')}`,
    }),
    notes: zod_1.z.string().max(2000).optional(),
};
// Create Tenant schema
exports.createTenantSchema = zod_1.z.object({
    firstName: baseTenantSchema.firstName,
    lastName: baseTenantSchema.lastName,
    email: baseTenantSchema.email,
    phone: baseTenantSchema.phone,
    dateOfBirth: baseTenantSchema.dateOfBirth,
    governmentIdType: baseTenantSchema.governmentIdType,
    governmentIdNumber: baseTenantSchema.governmentIdNumber,
    emergencyContactName: baseTenantSchema.emergencyContactName,
    emergencyContactPhone: baseTenantSchema.emergencyContactPhone,
    occupation: baseTenantSchema.occupation,
    employer: baseTenantSchema.employer,
    unitId: zod_1.z.string().uuid().optional(),
    status: baseTenantSchema.status.default('Prospect'),
    notes: baseTenantSchema.notes,
});
// Update Tenant schema (all fields optional except tenantId)
exports.updateTenantSchema = zod_1.z.object({
    firstName: baseTenantSchema.firstName.optional(),
    lastName: baseTenantSchema.lastName.optional(),
    email: baseTenantSchema.email.optional(),
    phone: baseTenantSchema.phone,
    dateOfBirth: baseTenantSchema.dateOfBirth,
    governmentIdType: baseTenantSchema.governmentIdType,
    governmentIdNumber: baseTenantSchema.governmentIdNumber,
    emergencyContactName: baseTenantSchema.emergencyContactName,
    emergencyContactPhone: baseTenantSchema.emergencyContactPhone,
    occupation: baseTenantSchema.occupation,
    employer: baseTenantSchema.employer,
    unitId: zod_1.z.string().uuid().optional().nullable(),
    status: zod_1.z.enum(exports.TENANT_STATUSES, {
        message: `Status must be one of: ${exports.TENANT_STATUSES.join(', ')}`,
    }).optional(),
    notes: baseTenantSchema.notes,
});
// List Tenants schema (query parameters)
exports.listTenantsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    unitId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(exports.TENANT_STATUSES).optional(),
    sortBy: zod_1.z.enum(['createdAt', 'firstName', 'lastName', 'email', 'status']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    search: zod_1.z.string().max(255).optional(),
});
// Tenant ID schema (path parameter)
exports.tenantIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Tenant ID must be a valid UUID'),
});
