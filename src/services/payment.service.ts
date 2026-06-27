import { Payment } from '@prisma/client';
import { 
  paymentRepository, 
  CreatePaymentInput, 
  UpdatePaymentInput, 
  PaginationOptions, 
  PaymentFilter,
  PaymentSearchOptions
} from '../repositories/payment.repository';
import { leaseRepository } from '../repositories/lease.repository';
import { organizationRepository } from '../repositories/organization.repository';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export interface ActorContext {
  userId: string;
  organizationId: string;
}

export interface ListPaymentsInput {
  page: number;
  limit: number;
  status?: string;
  paymentMethod?: string;
  paymentType?: string;
  leaseId?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'paymentDate' | 'dueDate' | 'amount' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export const PAYMENT_STATUSES = ['Pending', 'Paid', 'PartiallyPaid', 'Overdue', 'Failed', 'Refunded', 'Cancelled'] as const;
export const PAYMENT_METHODS = ['Cash', 'BankTransfer', 'Cheque', 'CreditCard', 'DebitCard', 'UPI', 'Online'] as const;
export const PAYMENT_TYPES = ['Rent', 'SecurityDeposit', 'LateFee', 'Discount', 'Refund', 'Other'] as const;

export class PaymentService {
  /**
   * Create a new payment
   */
  async createPayment(ctx: ActorContext, input: CreatePaymentInput): Promise<Payment> {
    // Validate organization exists
    const organization = await organizationRepository.findByIdAndOrganizationId(ctx.organizationId, ctx.organizationId);
    if (!organization) {
      throw new ForbiddenError('Organization not found');
    }

    // Validate lease exists and belongs to organization
    const lease = await leaseRepository.findByIdAndOrganizationId(input.leaseId, ctx.organizationId);
    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    // Validate payment number is unique per organization
    const paymentExists = await paymentRepository.paymentNumberExists(
      ctx.organizationId,
      input.paymentNumber
    );
    if (paymentExists) {
      throw new ConflictError('Payment number already exists in this organization');
    }

    // Validate amount is positive
    if (input.amount <= 0) {
      throw new ValidationError({
        amount: ['Payment amount must be greater than zero'],
      });
    }

    // Validate payment method
    if (input.paymentMethod && !PAYMENT_METHODS.includes(input.paymentMethod as any)) {
      throw new ValidationError({
        paymentMethod: [`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`],
      });
    }

    // Validate payment type
    if (input.paymentType && !PAYMENT_TYPES.includes(input.paymentType as any)) {
      throw new ValidationError({
        paymentType: [`Payment type must be one of: ${PAYMENT_TYPES.join(', ')}`],
      });
    }

    // Validate status
    if (input.status && !PAYMENT_STATUSES.includes(input.status as any)) {
      throw new ValidationError({
        status: [`Status must be one of: ${PAYMENT_STATUSES.join(', ')}`],
      });
    }

    // Validate dates
    if (input.dueDate < input.paymentDate) {
      throw new ValidationError({
        dueDate: ['Due date must be after or equal to payment date'],
      });
    }

    // Validate optional monetary fields
    if (input.lateFee !== undefined && input.lateFee < 0) {
      throw new ValidationError({
        lateFee: ['Late fee must be a non-negative value'],
      });
    }

    if (input.discount !== undefined && input.discount < 0) {
      throw new ValidationError({
        discount: ['Discount must be a non-negative value'],
      });
    }

    if (input.tax !== undefined && input.tax < 0) {
      throw new ValidationError({
        tax: ['Tax must be a non-negative value'],
      });
    }

    // Calculate outstanding balance if not provided
    const totalCharges = (input.lateFee || 0) + (input.tax || 0);
    const totalCredits = (input.discount || 0) + (input.paidAmount || 0);
    const outstandingBalance = input.amount + totalCharges - totalCredits;

    // Extract property, unit, tenant IDs from lease
    const paymentData = {
      ...input,
      propertyId: lease.propertyId,
      unitId: lease.unitId,
      tenantId: lease.tenantId,
      outstandingBalance: outstandingBalance > 0 ? outstandingBalance : 0,
    };

    const payment = await paymentRepository.create(ctx.organizationId, paymentData, ctx.userId);

    logger.info('Payment created', {
      paymentId: payment.id,
      leaseId: payment.leaseId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return payment;
  }

  /**
   * Get payment by ID
   */
  async getPayment(ctx: ActorContext, paymentId: string): Promise<Payment> {
    const payment = await paymentRepository.findByIdAndOrganizationId(paymentId, ctx.organizationId);
    
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  /**
   * List payments with pagination, filtering, and search
   */
  async listPayments(ctx: ActorContext, input: ListPaymentsInput): Promise<{ data: Payment[]; total: number; pages: number }> {
    const filter: PaymentFilter = {};
    
    if (input.status) filter.status = input.status;
    if (input.paymentMethod) filter.paymentMethod = input.paymentMethod;
    if (input.paymentType) filter.paymentType = input.paymentType;
    if (input.leaseId) filter.leaseId = input.leaseId;
    if (input.propertyId) filter.propertyId = input.propertyId;
    if (input.unitId) filter.unitId = input.unitId;
    if (input.tenantId) filter.tenantId = input.tenantId;
    if (input.startDate) filter.startDate = new Date(input.startDate);
    if (input.endDate) filter.endDate = new Date(input.endDate);

    const search: PaymentSearchOptions = {
      search: input.search,
      sortBy: input.sortBy || 'createdAt',
      sortOrder: input.sortOrder || 'desc',
    };

    const paginationOptions: PaginationOptions = {
      page: input.page,
      limit: input.limit,
    };

    const { data, total } = await paymentRepository.listWithFilters(
      ctx.organizationId,
      paginationOptions,
      filter,
      search
    );

    const pages = Math.ceil(total / input.limit);

    return { data, total, pages };
  }

  /**
   * Update payment
   * Note: Cannot update paid/refunded payments except through special workflows
   */
  async updatePayment(ctx: ActorContext, paymentId: string, input: UpdatePaymentInput): Promise<Payment> {
    const payment = await this.getPayment(ctx, paymentId);

    // Validate that paid/refunded/cancelled payments cannot be edited
    if (['Paid', 'Refunded', 'Cancelled'].includes(payment.status)) {
      throw new ForbiddenError(`Cannot update payment with status: ${payment.status}`);
    }

    // Validate payment method if provided
    if (input.paymentMethod && !PAYMENT_METHODS.includes(input.paymentMethod as any)) {
      throw new ValidationError({
        paymentMethod: [`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`],
      });
    }

    // Validate payment type if provided
    if (input.paymentType && !PAYMENT_TYPES.includes(input.paymentType as any)) {
      throw new ValidationError({
        paymentType: [`Payment type must be one of: ${PAYMENT_TYPES.join(', ')}`],
      });
    }

    // Validate status if provided
    if (input.status && !PAYMENT_STATUSES.includes(input.status as any)) {
      throw new ValidationError({
        status: [`Status must be one of: ${PAYMENT_STATUSES.join(', ')}`],
      });
    }

    // Validate monetary fields if provided
    if (input.lateFee !== undefined && input.lateFee < 0) {
      throw new ValidationError({
        lateFee: ['Late fee must be a non-negative value'],
      });
    }

    if (input.discount !== undefined && input.discount < 0) {
      throw new ValidationError({
        discount: ['Discount must be a non-negative value'],
      });
    }

    if (input.tax !== undefined && input.tax < 0) {
      throw new ValidationError({
        tax: ['Tax must be a non-negative value'],
      });
    }

    // Calculate updated outstanding balance
    const lateFee = input.lateFee !== undefined ? input.lateFee : payment.lateFee;
    const discount = input.discount !== undefined ? input.discount : payment.discount;
    const tax = input.tax !== undefined ? input.tax : payment.tax;
    const paidAmount = input.paidAmount !== undefined ? input.paidAmount : payment.paidAmount;

    const totalCharges = (lateFee || 0) + (tax || 0);
    const totalCredits = (discount || 0) + (paidAmount || 0);
    const outstandingBalance = Number(payment.amount) + totalCharges - totalCredits;

    const updateData = {
      ...input,
      outstandingBalance: outstandingBalance > 0 ? outstandingBalance : 0,
    };

    const updated = await paymentRepository.update(paymentId, ctx.organizationId, updateData, ctx.userId);

    logger.info('Payment updated', {
      paymentId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return updated;
  }

  /**
   * Mark payment as paid
   */
  async markAsPaid(ctx: ActorContext, paymentId: string, paidAmount?: number): Promise<Payment> {
    const payment = await this.getPayment(ctx, paymentId);

    if (payment.status === 'Paid') {
      throw new ConflictError('Payment is already marked as paid');
    }

    if (payment.status === 'Cancelled' || payment.status === 'Refunded') {
      throw new ForbiddenError(`Cannot mark ${payment.status} payment as paid`);
    }

    const actualPaidAmount = paidAmount || Number(payment.amount);

    if (actualPaidAmount <= 0) {
      throw new ValidationError({
        paidAmount: ['Paid amount must be greater than zero'],
      });
    }

    if (actualPaidAmount > Number(payment.amount)) {
      throw new ValidationError({
        paidAmount: ['Paid amount cannot exceed payment amount'],
      });
    }

    const newStatus = actualPaidAmount === Number(payment.amount) ? 'Paid' : 'PartiallyPaid';
    const outstandingBalance = Number(payment.amount) - actualPaidAmount;

    const updated = await paymentRepository.update(
      paymentId,
      ctx.organizationId,
      {
        status: newStatus,
        paidAmount: actualPaidAmount,
        outstandingBalance: outstandingBalance > 0 ? outstandingBalance : 0,
        paidAt: newStatus === 'Paid' ? new Date() : null,
      },
      ctx.userId
    );

    logger.info('Payment marked as paid', {
      paymentId,
      paidAmount: actualPaidAmount,
      newStatus,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return updated;
  }

  /**
   * Mark payment as overdue
   */
  async markAsOverdue(ctx: ActorContext, paymentId: string): Promise<Payment> {
    const payment = await this.getPayment(ctx, paymentId);

    if (payment.status === 'Paid' || payment.status === 'Refunded') {
      throw new ForbiddenError(`Cannot mark ${payment.status} payment as overdue`);
    }

    const updated = await paymentRepository.update(
      paymentId,
      ctx.organizationId,
      { status: 'Overdue' },
      ctx.userId
    );

    logger.info('Payment marked as overdue', {
      paymentId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return updated;
  }

  /**
   * Refund payment
   */
  async refundPayment(ctx: ActorContext, paymentId: string, refundAmount?: number): Promise<Payment> {
    const payment = await this.getPayment(ctx, paymentId);

    if (!['Paid', 'PartiallyPaid'].includes(payment.status)) {
      throw new ForbiddenError(`Cannot refund payment with status: ${payment.status}`);
    }

    const actualRefundAmount = refundAmount || Number(payment.paidAmount || payment.amount);

    if (actualRefundAmount <= 0) {
      throw new ValidationError({
        refundAmount: ['Refund amount must be greater than zero'],
      });
    }

    if (actualRefundAmount > Number(payment.paidAmount || 0)) {
      throw new ValidationError({
        refundAmount: ['Refund amount cannot exceed paid amount'],
      });
    }

    const updated = await paymentRepository.update(
      paymentId,
      ctx.organizationId,
      {
        status: 'Refunded',
        paidAmount: 0,
        outstandingBalance: 0,
        notes: `${payment.notes || ''} [Refunded: ${actualRefundAmount}]`.trim(),
      },
      ctx.userId
    );

    logger.info('Payment refunded', {
      paymentId,
      refundAmount: actualRefundAmount,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return updated;
  }

  /**
   * Generate receipt
   */
  async generateReceipt(ctx: ActorContext, paymentId: string): Promise<string> {
    const payment = await this.getPayment(ctx, paymentId);

    if (!['Paid', 'PartiallyPaid'].includes(payment.status)) {
      throw new ForbiddenError(`Cannot generate receipt for ${payment.status} payment`);
    }

    // Generate receipt number if not already generated
    let receiptNumber = payment.receiptNumber;
    if (!receiptNumber) {
      receiptNumber = `RCP-${ctx.organizationId.substring(0, 8).toUpperCase()}-${payment.id.substring(0, 8).toUpperCase()}-${Date.now()}`;
      await paymentRepository.update(
        paymentId,
        ctx.organizationId,
        { receiptNumber },
        ctx.userId
      );
    }

    logger.info('Receipt generated', {
      paymentId,
      receiptNumber,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return receiptNumber;
  }

  /**
   * Delete payment (soft delete)
   */
  async deletePayment(ctx: ActorContext, paymentId: string): Promise<Payment> {
    const payment = await this.getPayment(ctx, paymentId);

    if (payment.deletedAt) {
      throw new ConflictError('Payment is already deleted');
    }

    const deleted = await paymentRepository.softDelete(paymentId, ctx.organizationId, ctx.userId);

    logger.info('Payment deleted', {
      paymentId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return deleted;
  }

  /**
   * Restore payment
   */
  async restorePayment(ctx: ActorContext, paymentId: string): Promise<Payment> {
    const payment = await paymentRepository.findByIdAndOrganizationId(paymentId, ctx.organizationId);

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (!payment.deletedAt) {
      throw new ConflictError('Payment is not deleted');
    }

    const restored = await paymentRepository.restore(paymentId, ctx.organizationId, ctx.userId);

    logger.info('Payment restored', {
      paymentId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return restored;
  }

  /**
   * Get organization payment statistics
   */
  async getOrganizationStatistics(ctx: ActorContext): Promise<any> {
    return paymentRepository.getOrganizationStatistics(ctx.organizationId);
  }

  /**
   * Get lease payment statistics
   */
  async getLeaseStatistics(ctx: ActorContext, leaseId: string): Promise<any> {
    // Verify lease exists
    const lease = await leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    return paymentRepository.getLeaseStatistics(leaseId, ctx.organizationId);
  }

  /**
   * Get tenant payment statistics
   */
  async getTenantStatistics(ctx: ActorContext, tenantId: string): Promise<any> {
    return paymentRepository.getTenantStatistics(tenantId, ctx.organizationId);
  }
}

export const paymentService = new PaymentService();
