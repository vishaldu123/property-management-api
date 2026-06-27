import { z } from 'zod';

// Lease statuses
export const LEASE_STATUSES = ['Draft', 'Pending', 'Active', 'Expired', 'Terminated', 'Renewed'] as const;
export const BILLING_CYCLES = ['monthly', 'quarterly', 'annual'] as const;

// Base lease schema with common validations
const baseLeaseSchema = {
  leaseNumber: z.string().min(1, 'Lease number is required').max(100),
  propertyId: z.string().uuid('Property ID must be a valid UUID'),
  unitId: z.string().uuid('Unit ID must be a valid UUID'),
  tenantId: z.string().uuid('Tenant ID must be a valid UUID'),
  startDate: z.string().datetime('Start date must be a valid datetime'),
  endDate: z.string().datetime('End date must be a valid datetime'),
  moveInDate: z.string().datetime('Move-in date must be a valid datetime').optional(),
  moveOutDate: z.string().datetime('Move-out date must be a valid datetime').optional(),
  monthlyRent: z.coerce.number().min(0, 'Monthly rent must be a positive value'),
  securityDeposit: z.coerce.number().min(0, 'Security deposit must be a positive value'),
  billingCycle: z.enum(BILLING_CYCLES, {
    message: `Billing cycle must be one of: ${BILLING_CYCLES.join(', ')}`,
  }).default('monthly').optional(),
  gracePeriod: z.coerce.number().int().min(0, 'Grace period must be zero or positive').optional(),
  status: z.enum(LEASE_STATUSES, {
    message: `Status must be one of: ${LEASE_STATUSES.join(', ')}`,
  }).default('Draft').optional(),
  renewalOption: z.boolean().default(false).optional(),
  autoRenewal: z.boolean().default(false).optional(),
  noticePeriod: z.coerce.number().int().min(0, 'Notice period must be zero or positive').default(30).optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
};

// Create lease schema
export const createLeaseSchema = z.object({
  leaseNumber: baseLeaseSchema.leaseNumber,
  propertyId: baseLeaseSchema.propertyId,
  unitId: baseLeaseSchema.unitId,
  tenantId: baseLeaseSchema.tenantId,
  startDate: baseLeaseSchema.startDate,
  endDate: baseLeaseSchema.endDate,
  moveInDate: baseLeaseSchema.moveInDate,
  moveOutDate: baseLeaseSchema.moveOutDate,
  monthlyRent: baseLeaseSchema.monthlyRent,
  securityDeposit: baseLeaseSchema.securityDeposit,
  billingCycle: baseLeaseSchema.billingCycle,
  gracePeriod: baseLeaseSchema.gracePeriod,
  status: baseLeaseSchema.status,
  renewalOption: baseLeaseSchema.renewalOption,
  autoRenewal: baseLeaseSchema.autoRenewal,
  noticePeriod: baseLeaseSchema.noticePeriod,
  notes: baseLeaseSchema.notes,
}).strict();

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;

// Update lease schema (all fields optional except leaseId)
export const updateLeaseSchema = z.object({
  leaseNumber: baseLeaseSchema.leaseNumber.optional(),
  startDate: baseLeaseSchema.startDate.optional(),
  endDate: baseLeaseSchema.endDate.optional(),
  moveInDate: baseLeaseSchema.moveInDate,
  moveOutDate: baseLeaseSchema.moveOutDate,
  monthlyRent: baseLeaseSchema.monthlyRent.optional(),
  securityDeposit: baseLeaseSchema.securityDeposit.optional(),
  billingCycle: baseLeaseSchema.billingCycle,
  gracePeriod: baseLeaseSchema.gracePeriod,
  status: baseLeaseSchema.status,
  renewalOption: baseLeaseSchema.renewalOption,
  autoRenewal: baseLeaseSchema.autoRenewal,
  noticePeriod: baseLeaseSchema.noticePeriod,
  notes: baseLeaseSchema.notes,
}).strict();

export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;

// List leases query schema
export const listLeasesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(LEASE_STATUSES).optional(),
  propertyId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  sortBy: z.enum(['startDate', 'endDate', 'createdAt', 'status']).default('startDate').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  search: z.string().max(255).optional(),
});

export type ListLeasesQuery = z.infer<typeof listLeasesSchema>;

// Lease ID schema
export const leaseIdSchema = z.object({
  id: z.string().uuid('Lease ID must be a valid UUID'),
});

export type LeaseIdParams = z.infer<typeof leaseIdSchema>;

// Renew lease schema
export const renewLeaseSchema = z.object({
  newStartDate: z.string().datetime('Start date must be a valid datetime'),
  newEndDate: z.string().datetime('End date must be a valid datetime'),
});

export type RenewLeaseInput = z.infer<typeof renewLeaseSchema>;

// Terminate lease schema
export const terminateLeaseSchema = z.object({
  reason: z.string().max(2000, 'Reason must be less than 2000 characters').optional(),
});

export type TerminateLeaseInput = z.infer<typeof terminateLeaseSchema>;
