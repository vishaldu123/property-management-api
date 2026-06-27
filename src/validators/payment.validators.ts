import { z } from 'zod';

// Payment status enum
export const PaymentStatusEnum = z.enum(['Pending', 'Paid', 'PartiallyPaid', 'Overdue', 'Failed', 'Refunded', 'Cancelled']);

// Payment method enum
export const PaymentMethodEnum = z.enum(['Cash', 'BankTransfer', 'Cheque', 'CreditCard', 'DebitCard', 'UPI', 'Online']);

// Payment type enum
export const PaymentTypeEnum = z.enum(['Rent', 'SecurityDeposit', 'LateFee', 'Discount', 'Refund', 'Other']);

// Create payment schema
export const createPaymentSchema = z.object({
  leaseId: z.string().uuid('Lease ID must be a valid UUID').min(1, 'Lease ID is required'),
  paymentNumber: z.string().min(1, 'Payment number is required').max(50, 'Payment number is too long'),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').optional().default('USD'),
  paymentDate: z.string().datetime('Payment date must be a valid ISO date').or(z.coerce.date()),
  dueDate: z.string().datetime('Due date must be a valid ISO date').or(z.coerce.date()),
  paymentMethod: PaymentMethodEnum.optional().default('BankTransfer'),
  paymentType: PaymentTypeEnum.optional().default('Rent'),
  status: PaymentStatusEnum.optional().default('Pending'),
  referenceNumber: z.string().max(100, 'Reference number is too long').optional(),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  lateFee: z.number().nonnegative('Late fee must be non-negative').optional(),
  discount: z.number().nonnegative('Discount must be non-negative').optional(),
  tax: z.number().nonnegative('Tax must be non-negative').optional(),
  receiptNumber: z.string().max(100, 'Receipt number is too long').optional(),
  paidAmount: z.number().nonnegative('Paid amount must be non-negative').optional(),
}).strict();

// Update payment schema
export const updatePaymentSchema = z.object({
  paymentDate: z.string().datetime('Payment date must be a valid ISO date').or(z.coerce.date()).optional(),
  dueDate: z.string().datetime('Due date must be a valid ISO date').or(z.coerce.date()).optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  paymentType: PaymentTypeEnum.optional(),
  status: PaymentStatusEnum.optional(),
  referenceNumber: z.string().max(100, 'Reference number is too long').optional(),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  lateFee: z.number().nonnegative('Late fee must be non-negative').optional(),
  discount: z.number().nonnegative('Discount must be non-negative').optional(),
  tax: z.number().nonnegative('Tax must be non-negative').optional(),
  receiptNumber: z.string().max(100, 'Receipt number is too long').optional(),
  paidAmount: z.number().nonnegative('Paid amount must be non-negative').optional(),
}).strict();

// List payments schema
export const listPaymentsSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  status: PaymentStatusEnum.optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  paymentType: PaymentTypeEnum.optional(),
  leaseId: z.string().uuid('Lease ID must be a valid UUID').optional(),
  propertyId: z.string().uuid('Property ID must be a valid UUID').optional(),
  unitId: z.string().uuid('Unit ID must be a valid UUID').optional(),
  tenantId: z.string().uuid('Tenant ID must be a valid UUID').optional(),
  startDate: z.string().datetime('Start date must be a valid ISO date').optional(),
  endDate: z.string().datetime('End date must be a valid ISO date').optional(),
  sortBy: z.enum(['paymentDate', 'dueDate', 'amount', 'createdAt', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().max(100, 'Search query is too long').optional(),
}).strict();

// Payment ID param schema
export const paymentIdParamSchema = z.object({
  paymentId: z.string().uuid('Payment ID must be a valid UUID'),
});

// Mark as paid schema
export const markAsPaidSchema = z.object({
  paidAmount: z.number().positive('Paid amount must be greater than zero').optional(),
}).strict();

// Mark as overdue schema
export const markAsOverdueSchema = z.object({}).strict();

// Refund payment schema
export const refundPaymentSchema = z.object({
  refundAmount: z.number().positive('Refund amount must be greater than zero').optional(),
}).strict();

// Generate receipt schema
export const generateReceiptSchema = z.object({}).strict();

// Lease ID param schema
export const leaseIdParamSchema = z.object({
  leaseId: z.string().uuid('Lease ID must be a valid UUID'),
});

// Tenant ID param schema
export const tenantIdParamSchema = z.object({
  tenantId: z.string().uuid('Tenant ID must be a valid UUID'),
});
