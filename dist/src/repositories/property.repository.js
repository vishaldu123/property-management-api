"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyRepository = exports.PropertyRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const repository_1 = require("../shared/core/repository");
class PropertyRepository extends repository_1.BaseRepository {
    constructor() {
        super(prisma_1.default, 'property');
    }
    /**
     * Find a property by code within an organization
     */
    async findByCode(organizationId, code) {
        return prisma_1.default.property.findFirst({
            where: {
                organizationId,
                code,
                deletedAt: null,
            },
        });
    }
    /**
     * Find a property by ID with organization isolation
     */
    async findByIdAndOrganizationId(id, organizationId) {
        return prisma_1.default.property.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * List properties with pagination, filtering, and sorting
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
     * Search properties by name, address, or city
     */
    async search(organizationId, query, pagination) {
        const searchCondition = {
            organizationId,
            deletedAt: null,
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { address: { contains: query, mode: 'insensitive' } },
                { city: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } },
            ],
        };
        return this.paginate(pagination, searchCondition);
    }
    /**
     * Filter properties by multiple criteria
     */
    async filter(organizationId, filters, pagination) {
        const where = {
            organizationId,
            deletedAt: null,
        };
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.propertyType) {
            where.propertyType = filters.propertyType;
        }
        if (filters.city) {
            where.city = { contains: filters.city, mode: 'insensitive' };
        }
        if (filters.country) {
            where.country = { contains: filters.country, mode: 'insensitive' };
        }
        return this.paginate(pagination, where);
    }
    /**
     * Create a new property
     */
    async create(data) {
        return prisma_1.default.property.create({ data });
    }
    /**
     * Update a property
     */
    async update(id, data) {
        return prisma_1.default.property.update({
            where: { id },
            data,
        });
    }
    /**
     * Count total properties in an organization
     */
    async countByOrganization(organizationId) {
        return prisma_1.default.property.count({
            where: {
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * Check if a property code exists in an organization
     */
    async codeExists(organizationId, code, excludeId) {
        const where = {
            organizationId,
            code,
            deletedAt: null,
        };
        if (excludeId) {
            where.id = { not: excludeId };
        }
        const count = await prisma_1.default.property.count({ where });
        return count > 0;
    }
    /**
     * Get property statistics for an organization
     */
    async getStatistics(organizationId) {
        const [total, active, draft, archived] = await Promise.all([
            prisma_1.default.property.count({
                where: { organizationId, deletedAt: null },
            }),
            prisma_1.default.property.count({
                where: { organizationId, status: 'ACTIVE', deletedAt: null },
            }),
            prisma_1.default.property.count({
                where: { organizationId, status: 'DRAFT', deletedAt: null },
            }),
            prisma_1.default.property.count({
                where: { organizationId, status: 'ARCHIVED', deletedAt: null },
            }),
        ]);
        return { total, active, draft, archived };
    }
}
exports.PropertyRepository = PropertyRepository;
exports.propertyRepository = new PropertyRepository();
