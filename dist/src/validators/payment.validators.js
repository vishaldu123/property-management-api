"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantIdParamSchema = exports.leaseIdParamSchema = exports.generateReceiptSchema = exports.refundPaymentSchema = exports.markAsOverdueSchema = exports.markAsPaidSchema = exports.paymentIdParamSchema = exports.listPaymentsSchema = exports.updatePaymentSchema = exports.createPaymentSchema = exports.PaymentTypeEnum = exports.PaymentMethodEnum = exports.PaymentStatusEnum = void 0;
const zod_1 = require("zod");
// Payment status enum
exports.PaymentStatusEnum = zod_1.z.enum(['Pending', 'Paid', 'PartiallyPaid', 'Overdue', 'Failed', 'Refunded', 'Cancelled']);
// Payment method enum
exports.PaymentMethodEnum = zod_1.z.enum(['Cash', 'BankTransfer', 'Cheque', 'CreditCard', 'DebitCard', 'UPI', 'Online']);
// Payment type enum
exports.PaymentTypeEnum = zod_1.z.enum(['Rent', 'SecurityDeposit', 'LateFee', 'Discount', 'Refund', 'Other']);
// Create payment schema
exports.createPaymentSchema = zod_1.z.object({
    leaseId: zod_1.z.string().uuid('Lease ID must be a valid UUID').min(1, 'Lease ID is required'),
    paymentNumber: zod_1.z.string().min(1, 'Payment number is required').max(50, 'Payment number is too long'),
    amount: zod_1.z.number().positive('Amount must be greater than zero'),
    currency: zod_1.z.string().length(3, 'Currency must be a 3-letter ISO code').optional().default('USD'),
    paymentDate: zod_1.z.string().datetime('Payment date must be a valid ISO date').or(zod_1.z.coerce.date()),
    dueDate: zod_1.z.string().datetime('Due date must be a valid ISO date').or(zod_1.z.coerce.date()),
    paymentMethod: exports.PaymentMethodEnum.optional().default('BankTransfer'),
    paymentType: exports.PaymentTypeEnum.optional().default('Rent'),
    status: exports.PaymentStatusEnum.optional().default('Pending'),
    referenceNumber: zod_1.z.string().max(100, 'Reference number is too long').optional(),
    notes: zod_1.z.string().max(1000, 'Notes are too long').optional(),
    lateFee: zod_1.z.number().nonnegative('Late fee must be non-negative').optional(),
    discount: zod_1.z.number().nonnegative('Discount must be non-negative').optional(),
    tax: zod_1.z.number().nonnegative('Tax must be non-negative').optional(),
    receiptNumber: zod_1.z.string().max(100, 'Receipt number is too long').optional(),
    paidAmount: zod_1.z.number().nonnegative('Paid amount must be non-negative').optional(),
}).strict();
// Update payment schema
exports.updatePaymentSchema = zod_1.z.object({
    paymentDate: zod_1.z.string().datetime('Payment date must be a valid ISO date').or(zod_1.z.coerce.date()).optional(),
    dueDate: zod_1.z.string().datetime('Due date must be a valid ISO date').or(zod_1.z.coerce.date()).optional(),
    paymentMethod: exports.PaymentMethodEnum.optional(),
    paymentType: exports.PaymentTypeEnum.optional(),
    status: exports.PaymentStatusEnum.optional(),
    referenceNumber: zod_1.z.string().max(100, 'Reference number is too long').optional(),
    notes: zod_1.z.string().max(1000, 'Notes are too long').optional(),
    lateFee: zod_1.z.number().nonnegative('Late fee must be non-negative').optional(),
    discount: zod_1.z.number().nonnegative('Discount must be non-negative').optional(),
    tax: zod_1.z.number().nonnegative('Tax must be non-negative').optional(),
    receiptNumber: zod_1.z.string().max(100, 'Receipt number is too long').optional(),
    paidAmount: zod_1.z.number().nonnegative('Paid amount must be non-negative').optional(),
}).strict();
// List payments schema
exports.listPaymentsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: zod_1.z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
    status: exports.PaymentStatusEnum.optional(),
    paymentMethod: exports.PaymentMethodEnum.optional(),
    paymentType: exports.PaymentTypeEnum.optional(),
    leaseId: zod_1.z.string().uuid('Lease ID must be a valid UUID').optional(),
    propertyId: zod_1.z.string().uuid('Property ID must be a valid UUID').optional(),
    unitId: zod_1.z.string().uuid('Unit ID must be a valid UUID').optional(),
    tenantId: zod_1.z.string().uuid('Tenant ID must be a valid UUID').optional(),
    startDate: zod_1.z.string().datetime('Start date must be a valid ISO date').optional(),
    endDate: zod_1.z.string().datetime('End date must be a valid ISO date').optional(),
    sortBy: zod_1.z.enum(['paymentDate', 'dueDate', 'amount', 'createdAt', 'status']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    search: zod_1.z.string().max(100, 'Search query is too long').optional(),
}).strict();
// Payment ID param schema
exports.paymentIdParamSchema = zod_1.z.object({
    paymentId: zod_1.z.string().uuid('Payment ID must be a valid UUID'),
});
// Mark as paid schema
exports.markAsPaidSchema = zod_1.z.object({
    paidAmount: zod_1.z.number().positive('Paid amount must be greater than zero').optional(),
}).strict();
// Mark as overdue schema
exports.markAsOverdueSchema = zod_1.z.object({}).strict();
// Refund payment schema
exports.refundPaymentSchema = zod_1.z.object({
    refundAmount: zod_1.z.number().positive('Refund amount must be greater than zero').optional(),
}).strict();
// Generate receipt schema
exports.generateReceiptSchema = zod_1.z.object({}).strict();
// Lease ID param schema
exports.leaseIdParamSchema = zod_1.z.object({
    leaseId: zod_1.z.string().uuid('Lease ID must be a valid UUID'),
});
// Tenant ID param schema
exports.tenantIdParamSchema = zod_1.z.object({
    tenantId: zod_1.z.string().uuid('Tenant ID must be a valid UUID'),
});
