import { z } from 'zod';

// Tenant status constants
export const TENANT_STATUSES = ['Prospect', 'Active', 'Notice', 'Former', 'Blacklisted'] as const;

// Base tenant schema object
const baseTenantSchema = {
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().datetime().optional(),
  governmentIdType: z.string().max(50).optional(),
  governmentIdNumber: z.string().max(50).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
  occupation: z.string().max(100).optional(),
  employer: z.string().max(100).optional(),
  status: z.enum(TENANT_STATUSES, {
    message: `Status must be one of: ${TENANT_STATUSES.join(', ')}`,
  }),
  notes: z.string().max(2000).optional(),
};

// Create Tenant schema
export const createTenantSchema = z.object({
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
  unitId: z.string().uuid().optional(),
  status: baseTenantSchema.status.default('Prospect'),
  notes: baseTenantSchema.notes,
});

// Update Tenant schema (all fields optional except tenantId)
export const updateTenantSchema = z.object({
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
  unitId: z.string().uuid().optional().nullable(),
  status: z.enum(TENANT_STATUSES, {
    message: `Status must be one of: ${TENANT_STATUSES.join(', ')}`,
  }).optional(),
  notes: baseTenantSchema.notes,
});

// List Tenants schema (query parameters)
export const listTenantsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unitId: z.string().uuid().optional(),
  status: z.enum(TENANT_STATUSES).optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'email', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(255).optional(),
});

// Tenant ID schema (path parameter)
export const tenantIdSchema = z.object({
  id: z.string().uuid('Tenant ID must be a valid UUID'),
});

// Export inferred types
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type ListTenantsQuery = z.infer<typeof listTenantsSchema>;
export type TenantIdParams = z.infer<typeof tenantIdSchema>;
