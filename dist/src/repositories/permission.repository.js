"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionRepository = exports.PermissionRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Permission Repository
 * Handles all permission-related database operations
 */
class PermissionRepository {
    /**
     * Create a new permission
     */
    async create(data) {
        logger_1.default.debug('Creating permission', { organizationId: data.organizationId, key: data.key });
        return prisma_1.default.permission.create({
            data: {
                organizationId: data.organizationId,
                key: data.key,
                name: data.name,
                description: data.description,
                createdBy: data.createdBy,
            },
        });
    }
    /**
     * Find permission by ID
     */
    async findById(id) {
        logger_1.default.debug('Finding permission by ID', { id });
        return prisma_1.default.permission.findUnique({
            where: { id },
        });
    }
    /**
     * Find permission by organization and key
     */
    async findByOrganizationAndKey(organizationId, key) {
        logger_1.default.debug('Finding permission by organization and key', { organizationId, key });
        return prisma_1.default.permission.findUnique({
            where: {
                organizationId_key: {
                    organizationId,
                    key,
                },
            },
        });
    }
    /**
     * Get all permissions for organization
     */
    async findByOrganization(organizationId, skip = 0, take = 100) {
        logger_1.default.debug('Finding permissions by organization', { organizationId, skip, take });
        return prisma_1.default.permission.findMany({
            where: {
                organizationId,
                deletedAt: null,
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Search permissions by key or name
     */
    async search(organizationId, query, skip = 0, take = 100) {
        logger_1.default.debug('Searching permissions', { organizationId, query, skip, take });
        return prisma_1.default.permission.findMany({
            where: {
                organizationId,
                deletedAt: null,
                OR: [
                    { key: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Update permission
     */
    async update(id, data) {
        logger_1.default.debug('Updating permission', { id });
        return prisma_1.default.permission.update({
            where: { id },
            data: {
                ...data,
                updatedBy: data.updatedBy || undefined,
            },
        });
    }
    /**
     * Soft delete permission
     */
    async delete(id, deletedBy) {
        logger_1.default.debug('Deleting permission', { id });
        return prisma_1.default.permission.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedBy: deletedBy,
            },
        });
    }
    /**
     * Count permissions for organization
     */
    async countByOrganization(organizationId) {
        return prisma_1.default.permission.count({
            where: {
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * Check if permission exists
     */
    async exists(organizationId, key) {
        const permission = await this.findByOrganizationAndKey(organizationId, key);
        return !!permission && !permission.deletedAt;
    }
    /**
     * Get permissions for roles
     */
    async getPermissionsForRoles(roleIds) {
        logger_1.default.debug('Getting permissions for roles', { roleIds });
        return prisma_1.default.permission.findMany({
            where: {
                roles: {
                    some: {
                        roleId: { in: roleIds },
                    },
                },
                deletedAt: null,
            },
        });
    }
}
exports.PermissionRepository = PermissionRepository;
exports.permissionRepository = new PermissionRepository();
