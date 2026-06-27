"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantRepository = exports.TenantRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const repository_1 = require("../shared/core/repository");
class TenantRepository extends repository_1.BaseRepository {
    constructor() {
        super(prisma_1.default, 'tenant');
    }
    /**
     * Find a tenant by email within an organization
     */
    async findByEmail(organizationId, email) {
        return prisma_1.default.tenant.findFirst({
            where: {
                organizationId,
                email,
                deletedAt: null,
            },
        });
    }
    /**
     * Find a tenant by ID with organization isolation
     */
    async findByIdAndOrganizationId(id, organizationId) {
        return prisma_1.default.tenant.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * Find tenants by unit ID with organization isolation
     */
    async findByUnitId(unitId, organizationId) {
        return prisma_1.default.tenant.findMany({
            where: {
                unitId,
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * List tenants with pagination and organization isolation
     */
    async paginateScoped(pagination, organizationId, where) {
        const scopedWhere = {
            ...where,
            organizationId,
            deletedAt: null,
        };
        return this.paginate(pagination, scopedWhere);
    }
    /**
     * Search tenants by first name, last name, email, or phone
     */
    async search(organizationId, query, pagination, unitId) {
        const searchCondition = {
            organizationId,
            deletedAt: null,
            OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query, mode: 'insensitive' } },
            ],
        };
        if (unitId) {
            searchCondition.unitId = unitId;
        }
        return this.paginate(pagination, searchCondition);
    }
    /**
     * Filter tenants by multiple criteria
     */
    async filter(organizationId, filters, pagination) {
        const where = {
            organizationId,
            deletedAt: null,
        };
        if (filters.unitId) {
            where.unitId = filters.unitId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        return this.paginate(pagination, where);
    }
    /**
     * Check if email exists within organization
     */
    async emailExists(organizationId, email, excludeId) {
        const where = {
            organizationId,
            email,
            deletedAt: null,
        };
        if (excludeId) {
            where.id = { not: excludeId };
        }
        const count = await prisma_1.default.tenant.count({ where });
        return count > 0;
    }
    /**
     * Count tenants by unit
     */
    async countByUnit(unitId) {
        return prisma_1.default.tenant.count({
            where: {
                unitId,
                deletedAt: null,
            },
        });
    }
    /**
     * Count tenants by organization
     */
    async countByOrganization(organizationId) {
        return prisma_1.default.tenant.count({
            where: {
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * Get tenant statistics by status
     */
    async getStatusStatistics(organizationId) {
        const statistics = await prisma_1.default.tenant.groupBy({
            by: ['status'],
            where: {
                organizationId,
                deletedAt: null,
            },
            _count: true,
        });
        return statistics.map(stat => ({
            status: stat.status,
            count: stat._count,
        }));
    }
    /**
     * Get tenant statistics by unit
     */
    async getUnitStatistics(organizationId) {
        const statistics = await prisma_1.default.tenant.groupBy({
            by: ['unitId'],
            where: {
                organizationId,
                deletedAt: null,
                unitId: { not: null },
            },
            _count: true,
        });
        return statistics.map(stat => ({
            unitId: stat.unitId,
            count: stat._count,
        }));
    }
    /**
     * Get organization-level tenant statistics
     */
    async getOrganizationStatistics(organizationId) {
        const [total, byStatus, byUnit] = await Promise.all([
            this.countByOrganization(organizationId),
            this.getStatusStatistics(organizationId),
            this.getUnitStatistics(organizationId),
        ]);
        return {
            total,
            byStatus,
            byUnit,
        };
    }
}
exports.TenantRepository = TenantRepository;
exports.tenantRepository = new TenantRepository();
