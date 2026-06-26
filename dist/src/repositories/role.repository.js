"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRepository = exports.RoleRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Role Repository
 * Handles all role-related database operations
 */
class RoleRepository {
    /**
     * Create a new role
     */
    async create(data) {
        logger_1.default.debug('Creating role', { organizationId: data.organizationId, key: data.key });
        return prisma_1.default.role.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                key: data.key,
                description: data.description,
                isDefault: data.isDefault || false,
                createdBy: data.createdBy,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    /**
     * Find role by ID
     */
    async findById(id) {
        logger_1.default.debug('Finding role by ID', { id });
        return prisma_1.default.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    /**
     * Find role by organization and key
     */
    async findByOrganizationAndKey(organizationId, key) {
        logger_1.default.debug('Finding role by organization and key', { organizationId, key });
        return prisma_1.default.role.findUnique({
            where: {
                organizationId_key: {
                    organizationId,
                    key,
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    /**
     * Get all roles for organization
     */
    async findByOrganization(organizationId, skip = 0, take = 100) {
        logger_1.default.debug('Finding roles by organization', { organizationId, skip, take });
        return prisma_1.default.role.findMany({
            where: {
                organizationId,
                deletedAt: null,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Search roles by key or name
     */
    async search(organizationId, query, skip = 0, take = 100) {
        logger_1.default.debug('Searching roles', { organizationId, query, skip, take });
        return prisma_1.default.role.findMany({
            where: {
                organizationId,
                deletedAt: null,
                OR: [
                    { key: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Update role
     */
    async update(id, data) {
        logger_1.default.debug('Updating role', { id });
        return prisma_1.default.role.update({
            where: { id },
            data: {
                ...data,
                updatedBy: data.updatedBy || undefined,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    /**
     * Soft delete role
     */
    async delete(id, deletedBy) {
        logger_1.default.debug('Deleting role', { id });
        return prisma_1.default.role.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedBy: deletedBy,
            },
        });
    }
    /**
     * Count roles for organization
     */
    async countByOrganization(organizationId) {
        return prisma_1.default.role.count({
            where: {
                organizationId,
                deletedAt: null,
            },
        });
    }
    /**
     * Check if role is default
     */
    async isDefault(roleId) {
        const role = await this.findById(roleId);
        return !!role && role.isDefault;
    }
    /**
     * Get default roles for organization
     */
    async getDefaultRoles(organizationId) {
        return prisma_1.default.role.findMany({
            where: {
                organizationId,
                isDefault: true,
                deletedAt: null,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    /**
     * Clone role with all permissions
     */
    async clone(roleId, newName, newKey, organizationId, clonedBy) {
        logger_1.default.debug('Cloning role', { roleId, newKey });
        const sourceRole = await this.findById(roleId);
        if (!sourceRole) {
            throw new Error('Source role not found');
        }
        // Create new role
        const newRole = await prisma_1.default.role.create({
            data: {
                organizationId,
                name: newName,
                key: newKey,
                description: sourceRole.description,
                isDefault: false,
                createdBy: clonedBy,
            },
        });
        // Copy all permissions
        if (sourceRole.permissions.length > 0) {
            await prisma_1.default.rolePermission.createMany({
                data: sourceRole.permissions.map(rp => ({
                    roleId: newRole.id,
                    permissionId: rp.permissionId,
                })),
            });
        }
        return this.findById(newRole.id);
    }
    /**
     * Assign permission to role
     */
    async assignPermission(roleId, permissionId) {
        logger_1.default.debug('Assigning permission to role', { roleId, permissionId });
        return prisma_1.default.rolePermission.create({
            data: {
                roleId,
                permissionId,
            },
            include: {
                permission: true,
            },
        });
    }
    /**
     * Remove permission from role
     */
    async removePermission(roleId, permissionId) {
        logger_1.default.debug('Removing permission from role', { roleId, permissionId });
        return prisma_1.default.rolePermission.delete({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
        });
    }
    /**
     * Check if role has permission
     */
    async hasPermission(roleId, permissionId) {
        const rp = await prisma_1.default.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
        });
        return !!rp;
    }
    /**
     * Get all permissions for role
     */
    async getPermissions(roleId) {
        return prisma_1.default.rolePermission.findMany({
            where: { roleId },
            include: {
                permission: true,
            },
        });
    }
    /**
     * Assign multiple permissions to role
     */
    async assignPermissions(roleId, permissionIds) {
        logger_1.default.debug('Assigning multiple permissions to role', { roleId, permissionIds });
        // Remove existing permissions
        await prisma_1.default.rolePermission.deleteMany({
            where: { roleId },
        });
        // Add new permissions
        if (permissionIds.length > 0) {
            await prisma_1.default.rolePermission.createMany({
                data: permissionIds.map(permissionId => ({
                    roleId,
                    permissionId,
                })),
            });
        }
        return this.findById(roleId);
    }
}
exports.RoleRepository = RoleRepository;
exports.roleRepository = new RoleRepository();
