import prisma from '../config/prisma';
import { Payment } from '@prisma/client';

export interface CreatePaymentInput {
  leaseId: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  paymentNumber: string;
  amount: number;
  currency?: string;
  paymentDate: Date;
  dueDate: Date;
  paymentMethod?: string;
  paymentType?: string;
  status?: string;
  referenceNumber?: string;
  notes?: string;
  lateFee?: number;
  discount?: number;
  tax?: number;
  receiptNumber?: string;
  paidAmount?: number;
  paidAt?: Date | null;
  outstandingBalance?: number;
}

export interface UpdatePaymentInput {
  paymentDate?: Date;
  dueDate?: Date;
  paymentMethod?: string;
  paymentType?: string;
  status?: string;
  referenceNumber?: string;
  notes?: string;
  lateFee?: number;
  discount?: number;
  tax?: number;
  receiptNumber?: string;
  paidAmount?: number;
  paidAt?: Date | null;
  outstandingBalance?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaymentFilter {
  status?: string;
  paymentMethod?: string;
  paymentType?: string;
  leaseId?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaymentSearchOptions {
  search?: string;
  filters?: PaymentFilter;
  sortBy?: 'paymentDate' | 'dueDate' | 'amount' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export class PaymentRepository {
  /**
   * Create a new payment
   */
  async create(organizationId: string, data: CreatePaymentInput, userId: string): Promise<Payment> {
    return prisma.payment.create({
      data: {
        ...data,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  /**
   * Find payment by ID and organization
   */
  async findByIdAndOrganizationId(id: string, organizationId: string): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Check if payment number exists in organization
   */
  async paymentNumberExists(organizationId: string, paymentNumber: string, excludeId?: string): Promise<boolean> {
    const payment = await prisma.payment.findFirst({
      where: {
        organizationId,
        paymentNumber,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return !!payment;
  }

  /**
   * Find payments for a lease
   */
  async findByLeaseId(leaseId: string, organizationId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: {
        leaseId,
        organizationId,
        deletedAt: null,
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  /**
   * List payments with pagination and filters
   */
  async listWithFilters(
    organizationId: string,
    options: PaginationOptions,
    filter?: PaymentFilter,
    search?: PaymentSearchOptions
  ): Promise<{ data: Payment[]; total: number }> {
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    // Apply filter
    if (filter) {
      if (filter.status) where.status = filter.status;
      if (filter.paymentMethod) where.paymentMethod = filter.paymentMethod;
      if (filter.paymentType) where.paymentType = filter.paymentType;
      if (filter.leaseId) where.leaseId = filter.leaseId;
      if (filter.propertyId) where.propertyId = filter.propertyId;
      if (filter.unitId) where.unitId = filter.unitId;
      if (filter.tenantId) where.tenantId = filter.tenantId;
      if (filter.startDate || filter.endDate) {
        where.paymentDate = {};
        if (filter.startDate) where.paymentDate.gte = filter.startDate;
        if (filter.endDate) where.paymentDate.lte = filter.endDate;
      }
    }

    // Apply search
    if (search?.search) {
      where.OR = [
        { paymentNumber: { contains: search.search, mode: 'insensitive' } },
        { referenceNumber: { contains: search.search, mode: 'insensitive' } },
        { notes: { contains: search.search, mode: 'insensitive' } },
      ];
    }

    const skip = (options.page - 1) * options.limit;
    const sortBy = search?.sortBy || 'createdAt';
    const sortOrder = search?.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.payment.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Update payment
   */
  async update(id: string, organizationId: string, data: UpdatePaymentInput, userId: string): Promise<Payment> {
    return prisma.payment.update({
      where: {
        id,
      },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  /**
   * Soft delete payment
   */
  async softDelete(id: string, organizationId: string, userId: string): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  /**
   * Restore payment
   */
  async restore(id: string, organizationId: string, userId: string): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedBy: userId,
      },
    });
  }

  /**
   * Get organization payment statistics
   */
  async getOrganizationStatistics(organizationId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    pendingCount: number;
    overDueCount: number;
    paidCount: number;
  }> {
    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      select: {
        amount: true,
        status: true,
        paidAmount: true,
        outstandingBalance: true,
      },
    });

    return {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      paidAmount: payments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0),
      outstandingAmount: payments.reduce((sum, p) => sum + Number(p.outstandingBalance || 0), 0),
      pendingCount: payments.filter(p => p.status === 'Pending').length,
      overDueCount: payments.filter(p => p.status === 'Overdue').length,
      paidCount: payments.filter(p => p.status === 'Paid').length,
    };
  }

  /**
   * Get lease payment statistics
   */
  async getLeaseStatistics(leaseId: string, organizationId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  }> {
    const payments = await prisma.payment.findMany({
      where: {
        leaseId,
        organizationId,
        deletedAt: null,
      },
      select: {
        amount: true,
        paidAmount: true,
        outstandingBalance: true,
        status: true,
      },
    });

    return {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      paidAmount: payments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0),
      outstandingAmount: payments.reduce((sum, p) => sum + Number(p.outstandingBalance || 0), 0),
    };
  }

  /**
   * Get tenant payment statistics
   */
  async getTenantStatistics(tenantId: string, organizationId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  }> {
    const payments = await prisma.payment.findMany({
      where: {
        tenantId,
        organizationId,
        deletedAt: null,
      },
      select: {
        amount: true,
        paidAmount: true,
        outstandingBalance: true,
        status: true,
      },
    });

    return {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      paidAmount: payments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0),
      outstandingAmount: payments.reduce((sum, p) => sum + Number(p.outstandingBalance || 0), 0),
    };
  }

  /**
   * Find overdue payments
   */
  async findOverduePayments(organizationId: string): Promise<Payment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.payment.findMany({
      where: {
        organizationId,
        dueDate: { lt: today },
        status: { in: ['Pending', 'PartiallyPaid'] },
        deletedAt: null,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Find payments by tenant
   */
  async findByTenantId(
    tenantId: string,
    organizationId: string,
    options?: PaginationOptions
  ): Promise<{ data: Payment[]; total: number }> {
    const skip = options ? (options.page - 1) * options.limit : undefined;
    const take = options?.limit;

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          tenantId,
          organizationId,
          deletedAt: null,
        },
        orderBy: { paymentDate: 'desc' },
        skip,
        take,
      }),
      prisma.payment.count({
        where: {
          tenantId,
          organizationId,
          deletedAt: null,
        },
      }),
    ]);

    return { data, total };
  }
}

export const paymentRepository = new PaymentRepository();
