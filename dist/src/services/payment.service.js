"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = exports.PAYMENT_TYPES = exports.PAYMENT_METHODS = exports.PAYMENT_STATUSES = void 0;
const payment_repository_1 = require("../repositories/payment.repository");
const lease_repository_1 = require("../repositories/lease.repository");
const organization_repository_1 = require("../repositories/organization.repository");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
exports.PAYMENT_STATUSES = ['Pending', 'Paid', 'PartiallyPaid', 'Overdue', 'Failed', 'Refunded', 'Cancelled'];
exports.PAYMENT_METHODS = ['Cash', 'BankTransfer', 'Cheque', 'CreditCard', 'DebitCard', 'UPI', 'Online'];
exports.PAYMENT_TYPES = ['Rent', 'SecurityDeposit', 'LateFee', 'Discount', 'Refund', 'Other'];
class PaymentService {
    /**
     * Create a new payment
     */
    async createPayment(ctx, input) {
        // Validate organization exists
        const organization = await organization_repository_1.organizationRepository.findByIdAndOrganizationId(ctx.organizationId, ctx.organizationId);
        if (!organization) {
            throw new errors_1.ForbiddenError('Organization not found');
        }
        // Validate lease exists and belongs to organization
        const lease = await lease_repository_1.leaseRepository.findByIdAndOrganizationId(input.leaseId, ctx.organizationId);
        if (!lease) {
            throw new errors_1.NotFoundError('Lease not found');
        }
        // Validate payment number is unique per organization
        const paymentExists = await payment_repository_1.paymentRepository.paymentNumberExists(ctx.organizationId, input.paymentNumber);
        if (paymentExists) {
            throw new errors_1.ConflictError('Payment number already exists in this organization');
        }
        // Validate amount is positive
        if (input.amount <= 0) {
            throw new errors_1.ValidationError({
                amount: ['Payment amount must be greater than zero'],
            });
        }
        // Validate payment method
        if (input.paymentMethod && !exports.PAYMENT_METHODS.includes(input.paymentMethod)) {
            throw new errors_1.ValidationError({
                paymentMethod: [`Payment method must be one of: ${exports.PAYMENT_METHODS.join(', ')}`],
            });
        }
        // Validate payment type
        if (input.paymentType && !exports.PAYMENT_TYPES.includes(input.paymentType)) {
            throw new errors_1.ValidationError({
                paymentType: [`Payment type must be one of: ${exports.PAYMENT_TYPES.join(', ')}`],
            });
        }
        // Validate status
        if (input.status && !exports.PAYMENT_STATUSES.includes(input.status)) {
            throw new errors_1.ValidationError({
                status: [`Status must be one of: ${exports.PAYMENT_STATUSES.join(', ')}`],
            });
        }
        // Validate dates
        if (input.dueDate < input.paymentDate) {
            throw new errors_1.ValidationError({
                dueDate: ['Due date must be after or equal to payment date'],
            });
        }
        // Validate optional monetary fields
        if (input.lateFee !== undefined && input.lateFee < 0) {
            throw new errors_1.ValidationError({
                lateFee: ['Late fee must be a non-negative value'],
            });
        }
        if (input.discount !== undefined && input.discount < 0) {
            throw new errors_1.ValidationError({
                discount: ['Discount must be a non-negative value'],
            });
        }
        if (input.tax !== undefined && input.tax < 0) {
            throw new errors_1.ValidationError({
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
        const payment = await payment_repository_1.paymentRepository.create(ctx.organizationId, paymentData, ctx.userId);
        logger_1.default.info('Payment created', {
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
    async getPayment(ctx, paymentId) {
        const payment = await payment_repository_1.paymentRepository.findByIdAndOrganizationId(paymentId, ctx.organizationId);
        if (!payment) {
            throw new errors_1.NotFoundError('Payment not found');
        }
        return payment;
    }
    /**
     * List payments with pagination, filtering, and search
     */
    async listPayments(ctx, input) {
        const filter = {};
        if (input.status)
            filter.status = input.status;
        if (input.paymentMethod)
            filter.paymentMethod = input.paymentMethod;
        if (input.paymentType)
            filter.paymentType = input.paymentType;
        if (input.leaseId)
            filter.leaseId = input.leaseId;
        if (input.propertyId)
            filter.propertyId = input.propertyId;
        if (input.unitId)
            filter.unitId = input.unitId;
        if (input.tenantId)
            filter.tenantId = input.tenantId;
        if (input.startDate)
            filter.startDate = new Date(input.startDate);
        if (input.endDate)
            filter.endDate = new Date(input.endDate);
        const search = {
            search: input.search,
            sortBy: input.sortBy || 'createdAt',
            sortOrder: input.sortOrder || 'desc',
        };
        const paginationOptions = {
            page: input.page,
            limit: input.limit,
        };
        const { data, total } = await payment_repository_1.paymentRepository.listWithFilters(ctx.organizationId, paginationOptions, filter, search);
        const pages = Math.ceil(total / input.limit);
        return { data, total, pages };
    }
    /**
     * Update payment
     * Note: Cannot update paid/refunded payments except through special workflows
     */
    async updatePayment(ctx, paymentId, input) {
        const payment = await this.getPayment(ctx, paymentId);
        // Validate that paid/refunded/cancelled payments cannot be edited
        if (['Paid', 'Refunded', 'Cancelled'].includes(payment.status)) {
            throw new errors_1.ForbiddenError(`Cannot update payment with status: ${payment.status}`);
        }
        // Validate payment method if provided
        if (input.paymentMethod && !exports.PAYMENT_METHODS.includes(input.paymentMethod)) {
            throw new errors_1.ValidationError({
                paymentMethod: [`Payment method must be one of: ${exports.PAYMENT_METHODS.join(', ')}`],
            });
        }
        // Validate payment type if provided
        if (input.paymentType && !exports.PAYMENT_TYPES.includes(input.paymentType)) {
            throw new errors_1.ValidationError({
                paymentType: [`Payment type must be one of: ${exports.PAYMENT_TYPES.join(', ')}`],
            });
        }
        // Validate status if provided
        if (input.status && !exports.PAYMENT_STATUSES.includes(input.status)) {
            throw new errors_1.ValidationError({
                status: [`Status must be one of: ${exports.PAYMENT_STATUSES.join(', ')}`],
            });
        }
        // Validate monetary fields if provided
        if (input.lateFee !== undefined && input.lateFee < 0) {
            throw new errors_1.ValidationError({
                lateFee: ['Late fee must be a non-negative value'],
            });
        }
        if (input.discount !== undefined && input.discount < 0) {
            throw new errors_1.ValidationError({
                discount: ['Discount must be a non-negative value'],
            });
        }
        if (input.tax !== undefined && input.tax < 0) {
            throw new errors_1.ValidationError({
                tax: ['Tax must be a non-negative value'],
            });
        }
        // Calculate updated outstanding balance
        const lateFee = input.lateFee !== undefined ? input.lateFee : payment.lateFee;
        const discount = input.discount !== undefined ? input.discount : payment.discount;
        const tax = input.tax !== undefined ? input.tax : payment.tax;
        const paidAmount = input.paidAmount !== undefined ? input.paidAmount : payment.paidAmount;
        const totalCharges = Number(lateFee ?? 0) + Number(tax ?? 0);
        const totalCredits = Number(discount ?? 0) + Number(paidAmount ?? 0);
        const outstandingBalance = Number(payment.amount) + totalCharges - totalCredits;
        const updateData = {
            ...input,
            outstandingBalance: outstandingBalance > 0 ? outstandingBalance : 0,
        };
        const updated = await payment_repository_1.paymentRepository.update(paymentId, ctx.organizationId, updateData, ctx.userId);
        logger_1.default.info('Payment updated', {
            paymentId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return updated;
    }
    /**
     * Mark payment as paid
     */
    async markAsPaid(ctx, paymentId, paidAmount) {
        const payment = await this.getPayment(ctx, paymentId);
        if (payment.status === 'Paid') {
            throw new errors_1.ConflictError('Payment is already marked as paid');
        }
        if (payment.status === 'Cancelled' || payment.status === 'Refunded') {
            throw new errors_1.ForbiddenError(`Cannot mark ${payment.status} payment as paid`);
        }
        const actualPaidAmount = paidAmount || Number(payment.amount);
        if (actualPaidAmount <= 0) {
            throw new errors_1.ValidationError({
                paidAmount: ['Paid amount must be greater than zero'],
            });
        }
        if (actualPaidAmount > Number(payment.amount)) {
            throw new errors_1.ValidationError({
                paidAmount: ['Paid amount cannot exceed payment amount'],
            });
        }
        const newStatus = actualPaidAmount === Number(payment.amount) ? 'Paid' : 'PartiallyPaid';
        const outstandingBalance = Number(payment.amount) - actualPaidAmount;
        const updated = await payment_repository_1.paymentRepository.update(paymentId, ctx.organizationId, {
            status: newStatus,
            paidAmount: actualPaidAmount,
            outstandingBalance: outstandingBalance > 0 ? outstandingBalance : 0,
            paidAt: newStatus === 'Paid' ? new Date() : null,
        }, ctx.userId);
        logger_1.default.info('Payment marked as paid', {
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
    async markAsOverdue(ctx, paymentId) {
        const payment = await this.getPayment(ctx, paymentId);
        if (payment.status === 'Paid' || payment.status === 'Refunded') {
            throw new errors_1.ForbiddenError(`Cannot mark ${payment.status} payment as overdue`);
        }
        const updated = await payment_repository_1.paymentRepository.update(paymentId, ctx.organizationId, { status: 'Overdue' }, ctx.userId);
        logger_1.default.info('Payment marked as overdue', {
            paymentId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return updated;
    }
    /**
     * Refund payment
     */
    async refundPayment(ctx, paymentId, refundAmount) {
        const payment = await this.getPayment(ctx, paymentId);
        if (!['Paid', 'PartiallyPaid'].includes(payment.status)) {
            throw new errors_1.ForbiddenError(`Cannot refund payment with status: ${payment.status}`);
        }
        const actualRefundAmount = refundAmount || Number(payment.paidAmount || payment.amount);
        if (actualRefundAmount <= 0) {
            throw new errors_1.ValidationError({
                refundAmount: ['Refund amount must be greater than zero'],
            });
        }
        if (actualRefundAmount > Number(payment.paidAmount || 0)) {
            throw new errors_1.ValidationError({
                refundAmount: ['Refund amount cannot exceed paid amount'],
            });
        }
        const updated = await payment_repository_1.paymentRepository.update(paymentId, ctx.organizationId, {
            status: 'Refunded',
            paidAmount: 0,
            outstandingBalance: 0,
            notes: `${payment.notes || ''} [Refunded: ${actualRefundAmount}]`.trim(),
        }, ctx.userId);
        logger_1.default.info('Payment refunded', {
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
    async generateReceipt(ctx, paymentId) {
        const payment = await this.getPayment(ctx, paymentId);
        if (!['Paid', 'PartiallyPaid'].includes(payment.status)) {
            throw new errors_1.ForbiddenError(`Cannot generate receipt for ${payment.status} payment`);
        }
        // Generate receipt number if not already generated
        let receiptNumber = payment.receiptNumber;
        if (!receiptNumber) {
            receiptNumber = `RCP-${ctx.organizationId.substring(0, 8).toUpperCase()}-${payment.id.substring(0, 8).toUpperCase()}-${Date.now()}`;
            await payment_repository_1.paymentRepository.update(paymentId, ctx.organizationId, { receiptNumber }, ctx.userId);
        }
        logger_1.default.info('Receipt generated', {
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
    async deletePayment(ctx, paymentId) {
        const payment = await this.getPayment(ctx, paymentId);
        if (payment.deletedAt) {
            throw new errors_1.ConflictError('Payment is already deleted');
        }
        const deleted = await payment_repository_1.paymentRepository.softDelete(paymentId, ctx.organizationId, ctx.userId);
        logger_1.default.info('Payment deleted', {
            paymentId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return deleted;
    }
    /**
     * Restore payment
     */
    async restorePayment(ctx, paymentId) {
        const payment = await payment_repository_1.paymentRepository.findByIdAndOrganizationId(paymentId, ctx.organizationId);
        if (!payment) {
            throw new errors_1.NotFoundError('Payment not found');
        }
        if (!payment.deletedAt) {
            throw new errors_1.ConflictError('Payment is not deleted');
        }
        const restored = await payment_repository_1.paymentRepository.restore(paymentId, ctx.organizationId, ctx.userId);
        logger_1.default.info('Payment restored', {
            paymentId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return restored;
    }
    /**
     * Get organization payment statistics
     */
    async getOrganizationStatistics(ctx) {
        return payment_repository_1.paymentRepository.getOrganizationStatistics(ctx.organizationId);
    }
    /**
     * Get lease payment statistics
     */
    async getLeaseStatistics(ctx, leaseId) {
        // Verify lease exists
        const lease = await lease_repository_1.leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
        if (!lease) {
            throw new errors_1.NotFoundError('Lease not found');
        }
        return payment_repository_1.paymentRepository.getLeaseStatistics(leaseId, ctx.organizationId);
    }
    /**
     * Get tenant payment statistics
     */
    async getTenantStatistics(ctx, tenantId) {
        return payment_repository_1.paymentRepository.getTenantStatistics(tenantId, ctx.organizationId);
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
