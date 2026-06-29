"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const payment_service_1 = require("../payment.service");
const payment_repository_1 = require("../../repositories/payment.repository");
const lease_repository_1 = require("../../repositories/lease.repository");
const organization_repository_1 = require("../../repositories/organization.repository");
const errors_1 = require("../../utils/errors");
// Mock repositories
jest.mock('../../repositories/payment.repository');
jest.mock('../../repositories/lease.repository');
jest.mock('../../repositories/organization.repository');
(0, globals_1.describe)('PaymentService', () => {
    const mockCtx = {
        userId: 'user-123',
        organizationId: 'org-123',
    };
    const mockLease = {
        id: 'lease-123',
        organizationId: 'org-123',
        propertyId: 'property-123',
        unitId: 'unit-123',
        tenantId: 'tenant-123',
        leaseNumber: 'L001',
        status: 'Active',
    };
    const mockPaymentInput = {
        leaseId: 'lease-123',
        propertyId: 'property-123',
        unitId: 'unit-123',
        tenantId: 'tenant-123',
        paymentNumber: 'PAY-001',
        amount: 10000,
        currency: 'USD',
        paymentDate: new Date('2026-06-27'),
        dueDate: new Date('2026-07-27'),
        paymentMethod: 'BankTransfer',
        paymentType: 'Rent',
        status: 'Pending',
    };
    const mockPayment = {
        id: 'payment-123',
        ...mockPaymentInput,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: 'user-123',
        updatedBy: 'user-123',
    };
    (0, globals_1.beforeEach)(() => {
        jest.clearAllMocks();
        jest.spyOn(organization_repository_1.organizationRepository, 'findByIdAndOrganizationId').mockResolvedValue({
            id: 'org-123',
        });
        jest.spyOn(lease_repository_1.leaseRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockLease);
        jest.spyOn(payment_repository_1.paymentRepository, 'paymentNumberExists').mockResolvedValue(false);
    });
    (0, globals_1.describe)('createPayment', () => {
        (0, globals_1.it)('should create a payment successfully', async () => {
            jest.spyOn(lease_repository_1.leaseRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockLease);
            jest.spyOn(payment_repository_1.paymentRepository, 'paymentNumberExists').mockResolvedValue(false);
            jest.spyOn(payment_repository_1.paymentRepository, 'create').mockResolvedValue(mockPayment);
            const result = await payment_service_1.paymentService.createPayment(mockCtx, mockPaymentInput);
            (0, globals_1.expect)(result).toEqual(mockPayment);
            (0, globals_1.expect)(payment_repository_1.paymentRepository.create).toHaveBeenCalledWith('org-123', globals_1.expect.objectContaining({
                leaseId: 'lease-123',
                amount: 10000,
                paymentNumber: 'PAY-001',
            }), 'user-123');
        });
        (0, globals_1.it)('should throw error if payment number already exists', async () => {
            jest.spyOn(payment_repository_1.paymentRepository, 'paymentNumberExists').mockResolvedValue(true);
            await (0, globals_1.expect)(payment_service_1.paymentService.createPayment(mockCtx, mockPaymentInput)).rejects.toThrow(errors_1.ConflictError);
        });
        (0, globals_1.it)('should throw error if amount is not positive', async () => {
            await (0, globals_1.expect)(payment_service_1.paymentService.createPayment(mockCtx, {
                ...mockPaymentInput,
                amount: -100,
            })).rejects.toThrow(errors_1.ValidationError);
        });
        (0, globals_1.it)('should throw error if lease not found', async () => {
            jest.spyOn(lease_repository_1.leaseRepository, 'findByIdAndOrganizationId').mockResolvedValue(null);
            await (0, globals_1.expect)(payment_service_1.paymentService.createPayment(mockCtx, mockPaymentInput)).rejects.toThrow(errors_1.NotFoundError);
        });
        (0, globals_1.it)('should throw error if invalid payment method', async () => {
            jest.spyOn(lease_repository_1.leaseRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockLease);
            await (0, globals_1.expect)(payment_service_1.paymentService.createPayment(mockCtx, {
                ...mockPaymentInput,
                paymentMethod: 'InvalidMethod',
            })).rejects.toThrow(errors_1.ValidationError);
        });
    });
    (0, globals_1.describe)('getPayment', () => {
        (0, globals_1.it)('should retrieve a payment successfully', async () => {
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockPayment);
            const result = await payment_service_1.paymentService.getPayment(mockCtx, 'payment-123');
            (0, globals_1.expect)(result).toEqual(mockPayment);
        });
        (0, globals_1.it)('should throw error if payment not found', async () => {
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(null);
            await (0, globals_1.expect)(payment_service_1.paymentService.getPayment(mockCtx, 'payment-invalid')).rejects.toThrow(errors_1.NotFoundError);
        });
    });
    (0, globals_1.describe)('markAsPaid', () => {
        (0, globals_1.it)('should mark payment as paid', async () => {
            const pendingPayment = { ...mockPayment, status: 'Pending', paidAmount: null };
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(pendingPayment);
            jest.spyOn(payment_repository_1.paymentRepository, 'update').mockResolvedValue({
                ...mockPayment,
                status: 'Paid',
                paidAmount: 10000,
            });
            const result = await payment_service_1.paymentService.markAsPaid(mockCtx, 'payment-123');
            (0, globals_1.expect)(result.status).toBe('Paid');
            (0, globals_1.expect)(payment_repository_1.paymentRepository.update).toHaveBeenCalledWith('payment-123', 'org-123', globals_1.expect.objectContaining({
                status: 'Paid',
                paidAmount: 10000,
            }), 'user-123');
        });
        (0, globals_1.it)('should mark payment as partially paid', async () => {
            const pendingPayment = { ...mockPayment, status: 'Pending' };
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(pendingPayment);
            jest.spyOn(payment_repository_1.paymentRepository, 'update').mockResolvedValue({
                ...mockPayment,
                status: 'PartiallyPaid',
                paidAmount: 5000,
            });
            const result = await payment_service_1.paymentService.markAsPaid(mockCtx, 'payment-123', 5000);
            (0, globals_1.expect)(result.status).toBe('PartiallyPaid');
        });
        (0, globals_1.it)('should throw error if payment already paid', async () => {
            const paidPayment = { ...mockPayment, status: 'Paid' };
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(paidPayment);
            await (0, globals_1.expect)(payment_service_1.paymentService.markAsPaid(mockCtx, 'payment-123')).rejects.toThrow(errors_1.ConflictError);
        });
    });
    (0, globals_1.describe)('refundPayment', () => {
        (0, globals_1.it)('should refund a paid payment', async () => {
            const paidPayment = { ...mockPayment, status: 'Paid', paidAmount: 10000 };
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(paidPayment);
            jest.spyOn(payment_repository_1.paymentRepository, 'update').mockResolvedValue({
                ...mockPayment,
                status: 'Refunded',
            });
            const result = await payment_service_1.paymentService.refundPayment(mockCtx, 'payment-123');
            (0, globals_1.expect)(result.status).toBe('Refunded');
        });
        (0, globals_1.it)('should throw error if payment not paid', async () => {
            const pendingPayment = { ...mockPayment, status: 'Pending' };
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(pendingPayment);
            await (0, globals_1.expect)(payment_service_1.paymentService.refundPayment(mockCtx, 'payment-123')).rejects.toThrow(errors_1.ForbiddenError);
        });
    });
    (0, globals_1.describe)('deletePayment', () => {
        (0, globals_1.it)('should soft delete a payment', async () => {
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockPayment);
            jest.spyOn(payment_repository_1.paymentRepository, 'softDelete').mockResolvedValue({
                ...mockPayment,
                deletedAt: new Date(),
            });
            const result = await payment_service_1.paymentService.deletePayment(mockCtx, 'payment-123');
            (0, globals_1.expect)(result.deletedAt).toBeDefined();
        });
        (0, globals_1.it)('should throw error if payment already deleted', async () => {
            const deletedPayment = { ...mockPayment, deletedAt: new Date() };
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(deletedPayment);
            await (0, globals_1.expect)(payment_service_1.paymentService.deletePayment(mockCtx, 'payment-123')).rejects.toThrow(errors_1.ConflictError);
        });
    });
    (0, globals_1.describe)('restorePayment', () => {
        (0, globals_1.it)('should restore a deleted payment', async () => {
            const deletedPayment = { ...mockPayment, deletedAt: new Date() };
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(deletedPayment);
            jest.spyOn(payment_repository_1.paymentRepository, 'restore').mockResolvedValue({
                ...mockPayment,
                deletedAt: null,
            });
            const result = await payment_service_1.paymentService.restorePayment(mockCtx, 'payment-123');
            (0, globals_1.expect)(result.deletedAt).toBeNull();
        });
    });
    (0, globals_1.describe)('generateReceipt', () => {
        (0, globals_1.it)('should generate receipt for paid payment', async () => {
            const paidPayment = { ...mockPayment, status: 'Paid', receiptNumber: null };
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(paidPayment);
            jest.spyOn(payment_repository_1.paymentRepository, 'update').mockResolvedValue({
                ...mockPayment,
                receiptNumber: 'RCP-ORG-PAY-123456',
            });
            const result = await payment_service_1.paymentService.generateReceipt(mockCtx, 'payment-123');
            (0, globals_1.expect)(result).toContain('RCP-');
        });
        (0, globals_1.it)('should throw error if payment not paid', async () => {
            const pendingPayment = { ...mockPayment, status: 'Pending' };
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(pendingPayment);
            await (0, globals_1.expect)(payment_service_1.paymentService.generateReceipt(mockCtx, 'payment-123')).rejects.toThrow(errors_1.ForbiddenError);
        });
    });
    (0, globals_1.describe)('Organization isolation', () => {
        (0, globals_1.it)('should not return payments from other organizations', async () => {
            jest.spyOn(payment_repository_1.paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(null);
            await (0, globals_1.expect)(payment_service_1.paymentService.getPayment(mockCtx, 'payment-123')).rejects.toThrow(errors_1.NotFoundError);
        });
        (0, globals_1.it)('should enforce organization scoping in list', async () => {
            jest.spyOn(payment_repository_1.paymentRepository, 'listWithFilters').mockResolvedValue({
                data: [],
                total: 0,
            });
            const result = await payment_service_1.paymentService.listPayments(mockCtx, {
                page: 1,
                limit: 10,
            });
            (0, globals_1.expect)(payment_repository_1.paymentRepository.listWithFilters).toHaveBeenCalledWith('org-123', globals_1.expect.any(Object), globals_1.expect.any(Object), globals_1.expect.any(Object));
        });
    });
});
