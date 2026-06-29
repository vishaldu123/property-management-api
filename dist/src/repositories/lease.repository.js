"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaseRepository = exports.LeaseRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class LeaseRepository {
    /**
     * Create a new lease
     */
    async create(organizationId, data, userId) {
        return prisma_1.default.lease.create({
            data: {
                ...data,
                organizationId,
                createdBy: userId,
                updatedBy: userId,
            },
        });
    }
    /**
     * Find lease by ID and organization
     */
    async findByIdAndOrganizationId(id, organizationId) {
        return prisma_1.default.lease.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * Find lease by lease number and organization
     */
    async findByLeaseNumberAndOrganizationId(leaseNumber, organizationId) {
        return prisma_1.default.lease.findFirst({
            where: {
                leaseNumber,
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * Find active lease for a unit
     * Only one active lease per unit at any given time
     */
    async findActiveLeaseForUnit(unitId, organizationId) {
        return prisma_1.default.lease.findFirst({
            where: {
                unitId,
                organizationId,
                status: 'Active',
                deletedAt: null,
            },
        });
    }
    /**
     * Get leases by unit with pagination
     */
    async findByUnitId(unitId, organizationId, pagination) {
        const [leases, total] = await Promise.all([
            prisma_1.default.lease.findMany({
                where: {
                    unitId,
                    organizationId,
                    deletedAt: null,
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
                orderBy: { startDate: 'desc' },
            }),
            prisma_1.default.lease.count({
                where: {
                    unitId,
                    organizationId,
                    deletedAt: null,
                },
            }),
        ]);
        return { leases, total };
    }
    /**
     * Get leases by tenant with pagination
     */
    async findByTenantId(tenantId, organizationId, pagination) {
        const [leases, total] = await Promise.all([
            prisma_1.default.lease.findMany({
                where: {
                    tenantId,
                    organizationId,
                    deletedAt: null,
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
                orderBy: { startDate: 'desc' },
            }),
            prisma_1.default.lease.count({
                where: {
                    tenantId,
                    organizationId,
                    deletedAt: null,
                },
            }),
        ]);
        return { leases, total };
    }
    /**
     * Get leases by property with pagination
     */
    async findByPropertyId(propertyId, organizationId, pagination) {
        const [leases, total] = await Promise.all([
            prisma_1.default.lease.findMany({
                where: {
                    propertyId,
                    organizationId,
                    deletedAt: null,
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
                orderBy: { startDate: 'desc' },
            }),
            prisma_1.default.lease.count({
                where: {
                    propertyId,
                    organizationId,
                    deletedAt: null,
                },
            }),
        ]);
        return { leases, total };
    }
    /**
     * Paginate leases with organization isolation
     */
    async paginateScoped(pagination, organizationId, where) {
        const [leases, total] = await Promise.all([
            prisma_1.default.lease.findMany({
                where: {
                    organizationId,
                    deletedAt: null,
                    ...where,
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
                orderBy: { startDate: 'desc' },
            }),
            prisma_1.default.lease.count({
                where: {
                    organizationId,
                    deletedAt: null,
                    ...where,
                },
            }),
        ]);
        return { leases, total };
    }
    /**
     * Search leases by lease number, tenant name, or unit number
     */
    async search(organizationId, query, pagination, unitId, tenantId, status) {
        const [leases, total] = await Promise.all([
            prisma_1.default.lease.findMany({
                where: {
                    organizationId,
                    deletedAt: null,
                    OR: [{ leaseNumber: { contains: query, mode: 'insensitive' } }],
                    ...(unitId && { unitId }),
                    ...(tenantId && { tenantId }),
                    ...(status && { status }),
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
                orderBy: { startDate: 'desc' },
            }),
            prisma_1.default.lease.count({
                where: {
                    organizationId,
                    deletedAt: null,
                    OR: [{ leaseNumber: { contains: query, mode: 'insensitive' } }],
                    ...(unitId && { unitId }),
                    ...(tenantId && { tenantId }),
                    ...(status && { status }),
                },
            }),
        ]);
        return { leases, total };
    }
    /**
     * Filter leases by status, property, unit, or tenant
     */
    async filter(organizationId, filters, pagination) {
        const [leases, total] = await Promise.all([
            prisma_1.default.lease.findMany({
                where: {
                    organizationId,
                    deletedAt: null,
                    ...(filters.status && { status: filters.status }),
                    ...(filters.propertyId && { propertyId: filters.propertyId }),
                    ...(filters.unitId && { unitId: filters.unitId }),
                    ...(filters.tenantId && { tenantId: filters.tenantId }),
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
                orderBy: { startDate: 'desc' },
            }),
            prisma_1.default.lease.count({
                where: {
                    organizationId,
                    deletedAt: null,
                    ...(filters.status && { status: filters.status }),
                    ...(filters.propertyId && { propertyId: filters.propertyId }),
                    ...(filters.unitId && { unitId: filters.unitId }),
                    ...(filters.tenantId && { tenantId: filters.tenantId }),
                },
            }),
        ]);
        return { leases, total };
    }
    /**
     * Update lease
     */
    async update(id, organizationId, data, userId) {
        return prisma_1.default.lease.update({
            where: { id },
            data: {
                ...data,
                updatedBy: userId,
            },
        });
    }
    /**
     * Soft delete lease
     */
    async delete(id, organizationId, userId) {
        return prisma_1.default.lease.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedBy: userId,
            },
        });
    }
    /**
     * Restore deleted lease
     */
    async restore(id, organizationId, userId) {
        return prisma_1.default.lease.update({
            where: { id },
            data: {
                deletedAt: null,
                updatedBy: userId,
            },
        });
    }
    /**
     * Check if lease number exists in organization
     */
    async leaseNumberExists(organizationId, leaseNumber, excludeId) {
        const count = await prisma_1.default.lease.count({
            where: {
                organizationId,
                leaseNumber,
                deletedAt: null,
                ...(excludeId && { id: { not: excludeId } }),
            },
        });
        return count > 0;
    }
    /**
     * Check if unit has overlapping active lease
     */
    async hasOverlappingLease(unitId, organizationId, startDate, endDate, excludeId) {
        const count = await prisma_1.default.lease.count({
            where: {
                unitId,
                organizationId,
                deletedAt: null,
                status: { not: 'Terminated' },
                ...(excludeId && { id: { not: excludeId } }),
                AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
            },
        });
        return count > 0;
    }
    /**
     * Get lease statistics by organization
     */
    async getOrganizationStatistics(organizationId) {
        const [total, byStatus] = await Promise.all([
            prisma_1.default.lease.count({
                where: {
                    organizationId,
                    deletedAt: null,
                },
            }),
            prisma_1.default.lease.groupBy({
                by: ['status'],
                where: {
                    organizationId,
                    deletedAt: null,
                },
                _count: true,
            }),
        ]);
        const statusMap = {};
        byStatus.forEach((item) => {
            statusMap[item.status] = item._count;
        });
        return {
            total,
            byStatus: statusMap,
        };
    }
    /**
     * Get lease statistics for a unit
     */
    async getUnitStatistics(unitId, organizationId) {
        const [totalLeases, activeLeases] = await Promise.all([
            prisma_1.default.lease.count({
                where: {
                    unitId,
                    organizationId,
                    deletedAt: null,
                },
            }),
            prisma_1.default.lease.count({
                where: {
                    unitId,
                    organizationId,
                    status: 'Active',
                    deletedAt: null,
                },
            }),
        ]);
        return {
            totalLeases,
            activeLeases,
        };
    }
    /**
     * Get lease statistics for a tenant
     */
    async getTenantStatistics(tenantId, organizationId) {
        const [totalLeases, activeLeases] = await Promise.all([
            prisma_1.default.lease.count({
                where: {
                    tenantId,
                    organizationId,
                    deletedAt: null,
                },
            }),
            prisma_1.default.lease.count({
                where: {
                    tenantId,
                    organizationId,
                    status: 'Active',
                    deletedAt: null,
                },
            }),
        ]);
        return {
            totalLeases,
            activeLeases,
        };
    }
}
exports.LeaseRepository = LeaseRepository;
exports.leaseRepository = new LeaseRepository();
