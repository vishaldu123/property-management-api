"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaseIdParamSchema = exports.updateLeaseSchema = exports.createLeaseSchema = void 0;
const zod_1 = require("zod");
exports.createLeaseSchema = zod_1.z.object({
    unitId: zod_1.z.string().uuid('Unit ID must be a valid UUID'),
    tenantId: zod_1.z.string().uuid('Tenant ID must be a valid UUID'),
    startDate: zod_1.z.string().min(1, 'Start date is required'),
    endDate: zod_1.z.string().min(1, 'End date is required'),
    monthlyRent: zod_1.z.number().positive('Monthly rent must be positive'),
    securityDeposit: zod_1.z.number().positive('Security deposit must be positive').optional(),
    depositPaid: zod_1.z.boolean().optional(),
});
exports.updateLeaseSchema = zod_1.z.object({
    startDate: zod_1.z.string().min(1, 'Start date is required').optional(),
    endDate: zod_1.z.string().min(1, 'End date is required').optional(),
    monthlyRent: zod_1.z.number().positive('Monthly rent must be positive').optional(),
    securityDeposit: zod_1.z.number().positive('Security deposit must be positive').optional(),
    depositPaid: zod_1.z.boolean().optional(),
});
exports.leaseIdParamSchema = zod_1.z.object({
    leaseId: zod_1.z.string().uuid('Lease ID must be a valid UUID'),
});
