"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminateLeaseSchema = exports.renewLeaseSchema = exports.leaseIdSchema = exports.listLeasesSchema = exports.updateLeaseSchema = exports.createLeaseSchema = exports.BILLING_CYCLES = exports.LEASE_STATUSES = void 0;
const zod_1 = require("zod");
// Lease statuses
exports.LEASE_STATUSES = ['Draft', 'Pending', 'Active', 'Expired', 'Terminated', 'Renewed'];
exports.BILLING_CYCLES = ['monthly', 'quarterly', 'annual'];
// Base lease schema with common validations
const baseLeaseSchema = {
    leaseNumber: zod_1.z.string().min(1, 'Lease number is required').max(100),
    propertyId: zod_1.z.string().uuid('Property ID must be a valid UUID'),
    unitId: zod_1.z.string().uuid('Unit ID must be a valid UUID'),
    tenantId: zod_1.z.string().uuid('Tenant ID must be a valid UUID'),
    startDate: zod_1.z.string().datetime('Start date must be a valid datetime'),
    endDate: zod_1.z.string().datetime('End date must be a valid datetime'),
    moveInDate: zod_1.z.string().datetime('Move-in date must be a valid datetime').optional(),
    moveOutDate: zod_1.z.string().datetime('Move-out date must be a valid datetime').optional(),
    monthlyRent: zod_1.z.coerce.number().min(0, 'Monthly rent must be a positive value'),
    securityDeposit: zod_1.z.coerce.number().min(0, 'Security deposit must be a positive value'),
    billingCycle: zod_1.z.enum(exports.BILLING_CYCLES, {
        message: `Billing cycle must be one of: ${exports.BILLING_CYCLES.join(', ')}`,
    }).default('monthly').optional(),
    gracePeriod: zod_1.z.coerce.number().int().min(0, 'Grace period must be zero or positive').optional(),
    status: zod_1.z.enum(exports.LEASE_STATUSES, {
        message: `Status must be one of: ${exports.LEASE_STATUSES.join(', ')}`,
    }).default('Draft').optional(),
    renewalOption: zod_1.z.boolean().default(false).optional(),
    autoRenewal: zod_1.z.boolean().default(false).optional(),
    noticePeriod: zod_1.z.coerce.number().int().min(0, 'Notice period must be zero or positive').default(30).optional(),
    notes: zod_1.z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
};
// Create lease schema
exports.createLeaseSchema = zod_1.z.object({
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
// Update lease schema (all fields optional except leaseId)
exports.updateLeaseSchema = zod_1.z.object({
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
// List leases query schema
exports.listLeasesSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.enum(exports.LEASE_STATUSES).optional(),
    propertyId: zod_1.z.string().uuid().optional(),
    unitId: zod_1.z.string().uuid().optional(),
    tenantId: zod_1.z.string().uuid().optional(),
    sortBy: zod_1.z.enum(['startDate', 'endDate', 'createdAt', 'status']).default('startDate').optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc').optional(),
    search: zod_1.z.string().max(255).optional(),
});
// Lease ID schema
exports.leaseIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Lease ID must be a valid UUID'),
});
// Renew lease schema
exports.renewLeaseSchema = zod_1.z.object({
    newStartDate: zod_1.z.string().datetime('Start date must be a valid datetime'),
    newEndDate: zod_1.z.string().datetime('End date must be a valid datetime'),
});
// Terminate lease schema
exports.terminateLeaseSchema = zod_1.z.object({
    reason: zod_1.z.string().max(2000, 'Reason must be less than 2000 characters').optional(),
});
