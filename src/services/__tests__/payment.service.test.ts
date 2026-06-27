import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { paymentService, ActorContext } from '../payment.service';
import { paymentRepository, CreatePaymentInput } from '../../repositories/payment.repository';
import { leaseRepository } from '../../repositories/lease.repository';
import { organizationRepository } from '../../repositories/organization.repository';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../utils/errors';

// Mock repositories
jest.mock('../../repositories/payment.repository');
jest.mock('../../repositories/lease.repository');
jest.mock('../../repositories/organization.repository');

describe('PaymentService', () => {
  const mockCtx: ActorContext = {
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

  const mockPaymentInput: CreatePaymentInput = {
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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(organizationRepository, 'findByIdAndOrganizationId').mockResolvedValue({
      id: 'org-123',
    } as any);
    jest.spyOn(leaseRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockLease as any);
    jest.spyOn(paymentRepository, 'paymentNumberExists').mockResolvedValue(false);
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      jest.spyOn(leaseRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockLease as any);
      jest.spyOn(paymentRepository, 'paymentNumberExists').mockResolvedValue(false);
      jest.spyOn(paymentRepository, 'create').mockResolvedValue(mockPayment as any);

      const result = await paymentService.createPayment(mockCtx, mockPaymentInput);

      expect(result).toEqual(mockPayment);
      expect(paymentRepository.create).toHaveBeenCalledWith(
        'org-123',
        expect.objectContaining({
          leaseId: 'lease-123',
          amount: 10000,
          paymentNumber: 'PAY-001',
        }),
        'user-123'
      );
    });

    it('should throw error if payment number already exists', async () => {
      jest.spyOn(paymentRepository, 'paymentNumberExists').mockResolvedValue(true);

      await expect(paymentService.createPayment(mockCtx, mockPaymentInput)).rejects.toThrow(ConflictError);
    });

    it('should throw error if amount is not positive', async () => {
      await expect(
        paymentService.createPayment(mockCtx, {
          ...mockPaymentInput,
          amount: -100,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if lease not found', async () => {
      jest.spyOn(leaseRepository, 'findByIdAndOrganizationId').mockResolvedValue(null);

      await expect(paymentService.createPayment(mockCtx, mockPaymentInput)).rejects.toThrow(NotFoundError);
    });

    it('should throw error if invalid payment method', async () => {
      jest.spyOn(leaseRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockLease as any);

      await expect(
        paymentService.createPayment(mockCtx, {
          ...mockPaymentInput,
          paymentMethod: 'InvalidMethod' as any,
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getPayment', () => {
    it('should retrieve a payment successfully', async () => {
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockPayment as any);

      const result = await paymentService.getPayment(mockCtx, 'payment-123');

      expect(result).toEqual(mockPayment);
    });

    it('should throw error if payment not found', async () => {
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(null);

      await expect(paymentService.getPayment(mockCtx, 'payment-invalid')).rejects.toThrow(NotFoundError);
    });
  });

  describe('markAsPaid', () => {
    it('should mark payment as paid', async () => {
      const pendingPayment = { ...mockPayment, status: 'Pending', paidAmount: null };
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(pendingPayment as any);
      jest.spyOn(paymentRepository, 'update').mockResolvedValue({
        ...mockPayment,
        status: 'Paid',
        paidAmount: 10000,
      } as any);

      const result = await paymentService.markAsPaid(mockCtx, 'payment-123');

      expect(result.status).toBe('Paid');
      expect(paymentRepository.update).toHaveBeenCalledWith(
        'payment-123',
        'org-123',
        expect.objectContaining({
          status: 'Paid',
          paidAmount: 10000,
        }),
        'user-123'
      );
    });

    it('should mark payment as partially paid', async () => {
      const pendingPayment = { ...mockPayment, status: 'Pending' };
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(pendingPayment as any);
      jest.spyOn(paymentRepository, 'update').mockResolvedValue({
        ...mockPayment,
        status: 'PartiallyPaid',
        paidAmount: 5000,
      } as any);

      const result = await paymentService.markAsPaid(mockCtx, 'payment-123', 5000);

      expect(result.status).toBe('PartiallyPaid');
    });

    it('should throw error if payment already paid', async () => {
      const paidPayment = { ...mockPayment, status: 'Paid' };
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(paidPayment as any);

      await expect(paymentService.markAsPaid(mockCtx, 'payment-123')).rejects.toThrow(ConflictError);
    });
  });

  describe('refundPayment', () => {
    it('should refund a paid payment', async () => {
      const paidPayment = { ...mockPayment, status: 'Paid', paidAmount: 10000 };
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(paidPayment as any);
      jest.spyOn(paymentRepository, 'update').mockResolvedValue({
        ...mockPayment,
        status: 'Refunded',
      } as any);

      const result = await paymentService.refundPayment(mockCtx, 'payment-123');

      expect(result.status).toBe('Refunded');
    });

    it('should throw error if payment not paid', async () => {
      const pendingPayment = { ...mockPayment, status: 'Pending' };
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(pendingPayment as any);

      await expect(paymentService.refundPayment(mockCtx, 'payment-123')).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deletePayment', () => {
    it('should soft delete a payment', async () => {
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(mockPayment as any);
      jest.spyOn(paymentRepository, 'softDelete').mockResolvedValue({
        ...mockPayment,
        deletedAt: new Date(),
      } as any);

      const result = await paymentService.deletePayment(mockCtx, 'payment-123');

      expect(result.deletedAt).toBeDefined();
    });

    it('should throw error if payment already deleted', async () => {
      const deletedPayment = { ...mockPayment, deletedAt: new Date() };
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(deletedPayment as any);

      await expect(paymentService.deletePayment(mockCtx, 'payment-123')).rejects.toThrow(ConflictError);
    });
  });

  describe('restorePayment', () => {
    it('should restore a deleted payment', async () => {
      const deletedPayment = { ...mockPayment, deletedAt: new Date() };
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(deletedPayment as any);
      jest.spyOn(paymentRepository, 'restore').mockResolvedValue({
        ...mockPayment,
        deletedAt: null,
      } as any);

      const result = await paymentService.restorePayment(mockCtx, 'payment-123');

      expect(result.deletedAt).toBeNull();
    });
  });

  describe('generateReceipt', () => {
    it('should generate receipt for paid payment', async () => {
      const paidPayment = { ...mockPayment, status: 'Paid', receiptNumber: null };
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(paidPayment as any);
      jest.spyOn(paymentRepository, 'update').mockResolvedValue({
        ...mockPayment,
        receiptNumber: 'RCP-ORG-PAY-123456',
      } as any);

      const result = await paymentService.generateReceipt(mockCtx, 'payment-123');

      expect(result).toContain('RCP-');
    });

    it('should throw error if payment not paid', async () => {
      const pendingPayment = { ...mockPayment, status: 'Pending' };
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(pendingPayment as any);

      await expect(paymentService.generateReceipt(mockCtx, 'payment-123')).rejects.toThrow(ForbiddenError);
    });
  });

  describe('Organization isolation', () => {
    it('should not return payments from other organizations', async () => {
      jest.spyOn(paymentRepository, 'findByIdAndOrganizationId').mockResolvedValue(null);

      await expect(paymentService.getPayment(mockCtx, 'payment-123')).rejects.toThrow(NotFoundError);
    });

    it('should enforce organization scoping in list', async () => {
      jest.spyOn(paymentRepository, 'listWithFilters').mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await paymentService.listPayments(mockCtx, {
        page: 1,
        limit: 10,
      });

      expect(paymentRepository.listWithFilters).toHaveBeenCalledWith('org-123', expect.any(Object), expect.any(Object), expect.any(Object));
    });
  });
});
