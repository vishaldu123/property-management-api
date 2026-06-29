"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = exports.PaymentRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class PaymentRepository {
    /**
     * Create a new payment
     */
    async create(organizationId, data, userId) {
        return prisma_1.default.payment.create({
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
    async findByIdAndOrganizationId(id, organizationId) {
        return prisma_1.default.payment.findFirst({
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
    async paymentNumberExists(organizationId, paymentNumber, excludeId) {
        const payment = await prisma_1.default.payment.findFirst({
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
    async findByLeaseId(leaseId, organizationId) {
        return prisma_1.default.payment.findMany({
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
    async listWithFilters(organizationId, options, filter, search) {
        const where = {
            organizationId,
            deletedAt: null,
        };
        // Apply filter
        if (filter) {
            if (filter.status)
                where.status = filter.status;
            if (filter.paymentMethod)
                where.paymentMethod = filter.paymentMethod;
            if (filter.paymentType)
                where.paymentType = filter.paymentType;
            if (filter.leaseId)
                where.leaseId = filter.leaseId;
            if (filter.propertyId)
                where.propertyId = filter.propertyId;
            if (filter.unitId)
                where.unitId = filter.unitId;
            if (filter.tenantId)
                where.tenantId = filter.tenantId;
            if (filter.startDate || filter.endDate) {
                where.paymentDate = {};
                if (filter.startDate)
                    where.paymentDate.gte = filter.startDate;
                if (filter.endDate)
                    where.paymentDate.lte = filter.endDate;
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
            prisma_1.default.payment.findMany({
                where,
                skip,
                take: options.limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            prisma_1.default.payment.count({ where }),
        ]);
        return { data, total };
    }
    /**
     * Update payment
     */
    async update(id, organizationId, data, userId) {
        return prisma_1.default.payment.update({
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
    async softDelete(id, organizationId, userId) {
        return prisma_1.default.payment.update({
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
    async restore(id, organizationId, userId) {
        return prisma_1.default.payment.update({
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
    async getOrganizationStatistics(organizationId) {
        const payments = await prisma_1.default.payment.findMany({
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
    async getLeaseStatistics(leaseId, organizationId) {
        const payments = await prisma_1.default.payment.findMany({
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
    async getTenantStatistics(tenantId, organizationId) {
        const payments = await prisma_1.default.payment.findMany({
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
    async findOverduePayments(organizationId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return prisma_1.default.payment.findMany({
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
    async findByTenantId(tenantId, organizationId, options) {
        const skip = options ? (options.page - 1) * options.limit : undefined;
        const take = options?.limit;
        const [data, total] = await Promise.all([
            prisma_1.default.payment.findMany({
                where: {
                    tenantId,
                    organizationId,
                    deletedAt: null,
                },
                orderBy: { paymentDate: 'desc' },
                skip,
                take,
            }),
            prisma_1.default.payment.count({
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
exports.PaymentRepository = PaymentRepository;
exports.paymentRepository = new PaymentRepository();
