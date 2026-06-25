import { z } from 'zod';

export const createLeaseSchema = z.object({
  unitId: z.string().uuid('Unit ID must be a valid UUID'),
  tenantId: z.string().uuid('Tenant ID must be a valid UUID'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  monthlyRent: z.number().positive('Monthly rent must be positive'),
  securityDeposit: z.number().positive('Security deposit must be positive').optional(),
  depositPaid: z.boolean().optional(),
});

export const updateLeaseSchema = z.object({
  startDate: z.string().min(1, 'Start date is required').optional(),
  endDate: z.string().min(1, 'End date is required').optional(),
  monthlyRent: z.number().positive('Monthly rent must be positive').optional(),
  securityDeposit: z.number().positive('Security deposit must be positive').optional(),
  depositPaid: z.boolean().optional(),
});

export const leaseIdParamSchema = z.object({
  leaseId: z.string().uuid('Lease ID must be a valid UUID'),
});