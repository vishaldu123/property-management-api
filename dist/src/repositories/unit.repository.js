"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitRepository = exports.UnitRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const repository_1 = require("../shared/core/repository");
class UnitRepository extends repository_1.BaseRepository {
    constructor() {
        super(prisma_1.default, 'unit');
    }
    /**
     * Find a unit by unit number within a property
     */
    async findByUnitNumber(propertyId, unitNumber) {
        return prisma_1.default.unit.findFirst({
            where: {
                propertyId,
                unitNumber,
                deletedAt: null,
            },
        });
    }
    /**
     * Find a unit by ID with organization and property isolation
     */
    async findByIdAndOrganizationId(id, organizationId) {
        return prisma_1.default.unit.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * Find units by property ID with organization isolation
     */
    async findByPropertyId(propertyId, organizationId) {
        return prisma_1.default.unit.findMany({
            where: {
                propertyId,
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * List units with pagination, filtering, and sorting
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
     * Search units by name, number, or block
     */
    async search(organizationId, query, pagination, propertyId) {
        const searchCondition = {
            organizationId,
            deletedAt: null,
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { unitNumber: { contains: query, mode: 'insensitive' } },
                { block: { contains: query, mode: 'insensitive' } },
            ],
        };
        if (propertyId) {
            searchCondition.propertyId = propertyId;
        }
        return this.paginate(pagination, searchCondition);
    }
    /**
     * Filter units by multiple criteria
     */
    async filter(organizationId, filters, pagination) {
        const where = {
            organizationId,
            deletedAt: null,
        };
        if (filters.propertyId) {
            where.propertyId = filters.propertyId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.unitType) {
            where.unitType = filters.unitType;
        }
        if (filters.floor !== undefined) {
            where.floor = filters.floor;
        }
        if (filters.block) {
            where.block = { contains: filters.block, mode: 'insensitive' };
        }
        return this.paginate(pagination, where);
    }
    /**
     * Create a new unit
     */
    async create(data) {
        return prisma_1.default.unit.create({ data });
    }
    /**
     * Update a unit
     */
    async update(id, data) {
        return prisma_1.default.unit.update({
            where: { id },
            data,
        });
    }
    /**
     * Count total units in a property
     */
    async countByProperty(propertyId) {
        return prisma_1.default.unit.count({
            where: {
                propertyId,
                deletedAt: null,
            },
        });
    }
    /**
     * Count total units in an organization
     */
    async countByOrganization(organizationId) {
        return prisma_1.default.unit.count({
            where: {
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * Check if a unit number exists in a property
     */
    async unitNumberExists(propertyId, unitNumber, excludeId) {
        const where = {
            propertyId,
            unitNumber,
            deletedAt: null,
        };
        if (excludeId) {
            where.id = { not: excludeId };
        }
        const count = await prisma_1.default.unit.count({ where });
        return count > 0;
    }
    /**
     * Get unit statistics for a property
     */
    async getPropertyStatistics(propertyId) {
        const [total, available, occupied, reserved, underMaintenance] = await Promise.all([
            prisma_1.default.unit.count({
                where: { propertyId, deletedAt: null },
            }),
            prisma_1.default.unit.count({
                where: { propertyId, status: 'Available', deletedAt: null },
            }),
            prisma_1.default.unit.count({
                where: { propertyId, status: 'Occupied', deletedAt: null },
            }),
            prisma_1.default.unit.count({
                where: { propertyId, status: 'Reserved', deletedAt: null },
            }),
            prisma_1.default.unit.count({
                where: { propertyId, status: 'Under Maintenance', deletedAt: null },
            }),
        ]);
        const byStatus = {
            available: available,
            occupied: occupied,
            reserved: reserved,
            underMaintenance: underMaintenance,
            inactive: total - available - occupied - reserved - underMaintenance,
        };
        const byType = await prisma_1.default.unit.groupBy({
            by: ['unitType'],
            where: { propertyId, deletedAt: null },
            _count: true,
        });
        const byTypeMap = {};
        byType.forEach(item => {
            byTypeMap[item.unitType] = item._count;
        });
        return {
            total,
            byStatus,
            byType: byTypeMap,
        };
    }
    /**
     * Get unit statistics for an organization
     */
    async getOrganizationStatistics(organizationId) {
        const [total, available, occupied, reserved, underMaintenance] = await Promise.all([
            prisma_1.default.unit.count({
                where: { organizationId, deletedAt: null },
            }),
            prisma_1.default.unit.count({
                where: { organizationId, status: 'Available', deletedAt: null },
            }),
            prisma_1.default.unit.count({
                where: { organizationId, status: 'Occupied', deletedAt: null },
            }),
            prisma_1.default.unit.count({
                where: { organizationId, status: 'Reserved', deletedAt: null },
            }),
            prisma_1.default.unit.count({
                where: { organizationId, status: 'Under Maintenance', deletedAt: null },
            }),
        ]);
        const byStatus = {
            available: available,
            occupied: occupied,
            reserved: reserved,
            underMaintenance: underMaintenance,
            inactive: total - available - occupied - reserved - underMaintenance,
        };
        return {
            total,
            byStatus,
        };
    }
}
exports.UnitRepository = UnitRepository;
exports.unitRepository = new UnitRepository();
