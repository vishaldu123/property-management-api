"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoleRepository = exports.UserRoleRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * User Role Repository
 * Handles user role assignment and retrieval
 */
class UserRoleRepository {
    /**
     * Assign a role to a user
     */
    async assignRole(data) {
        logger_1.default.debug('Assigning role to user', {
            organizationId: data.organizationId,
            userId: data.userId,
            roleId: data.roleId,
        });
        return prisma_1.default.userRole.create({
            data: {
                organizationId: data.organizationId,
                userId: data.userId,
                roleId: data.roleId,
                assignedBy: data.assignedBy,
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
    }
    /**
     * Remove a role from a user
     */
    async removeRole(organizationId, userId, roleId) {
        logger_1.default.debug('Removing role from user', { organizationId, userId, roleId });
        return prisma_1.default.userRole.delete({
            where: {
                organizationId_userId_roleId: {
                    organizationId,
                    userId,
                    roleId,
                },
            },
        });
    }
    /**
     * Replace all user roles with new roles
     */
    async replaceRoles(organizationId, userId, roleIds, replacedBy) {
        logger_1.default.debug('Replacing user roles', { organizationId, userId, roleIds });
        // Soft delete existing roles
        await prisma_1.default.userRole.updateMany({
            where: {
                organizationId,
                userId,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
                updatedBy: replacedBy,
            },
        });
        // Create new roles
        if (roleIds.length > 0) {
            await prisma_1.default.userRole.createMany({
                data: roleIds.map(roleId => ({
                    organizationId,
                    userId,
                    roleId,
                    assignedBy: replacedBy,
                })),
            });
        }
        return this.getUserRoles(organizationId, userId);
    }
    /**
     * Get all roles for a user in an organization
     */
    async getUserRoles(organizationId, userId) {
        logger_1.default.debug('Getting user roles', { organizationId, userId });
        return prisma_1.default.userRole.findMany({
            where: {
                organizationId,
                userId,
                deletedAt: null,
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    /**
     * Check if user has a specific role
     */
    async hasRole(organizationId, userId, roleId) {
        const userRole = await prisma_1.default.userRole.findUnique({
            where: {
                organizationId_userId_roleId: {
                    organizationId,
                    userId,
                    roleId,
                },
            },
        });
        return !!userRole && !userRole.deletedAt;
    }
    /**
     * Check if user has a role by key
     */
    async hasRoleByKey(organizationId, userId, roleKey) {
        const userRole = await prisma_1.default.userRole.findFirst({
            where: {
                organizationId,
                userId,
                deletedAt: null,
                role: {
                    key: roleKey,
                    organizationId,
                    deletedAt: null,
                },
            },
        });
        return !!userRole;
    }
    /**
     * Get user's role keys
     */
    async getUserRoleKeys(organizationId, userId) {
        const userRoles = await prisma_1.default.userRole.findMany({
            where: {
                organizationId,
                userId,
                deletedAt: null,
            },
            include: {
                role: true,
            },
        });
        return userRoles.map(ur => ur.role.key);
    }
    /**
     * Get all users with a specific role
     */
    async getUsersWithRole(organizationId, roleId, skip = 0, take = 100) {
        logger_1.default.debug('Getting users with role', { organizationId, roleId, skip, take });
        return prisma_1.default.userRole.findMany({
            where: {
                organizationId,
                roleId,
                deletedAt: null,
            },
            include: {
                user: true,
                role: true,
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Count users with a specific role
     */
    async countUsersWithRole(organizationId, roleId) {
        return prisma_1.default.userRole.count({
            where: {
                organizationId,
                roleId,
                deletedAt: null,
            },
        });
    }
    /**
     * Check for duplicate role assignment
     */
    async hasDuplicate(organizationId, userId, roleId) {
        const userRole = await prisma_1.default.userRole.findUnique({
            where: {
                organizationId_userId_roleId: {
                    organizationId,
                    userId,
                    roleId,
                },
            },
        });
        return !!userRole && !userRole.deletedAt;
    }
    /**
     * Get role assignment details
     */
    async getRoleAssignment(organizationId, userId, roleId) {
        return prisma_1.default.userRole.findUnique({
            where: {
                organizationId_userId_roleId: {
                    organizationId,
                    userId,
                    roleId,
                },
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
                user: true,
            },
        });
    }
    /**
     * Get all permissions for user in organization
     */
    async getUserPermissions(organizationId, userId) {
        logger_1.default.debug('Getting user permissions', { organizationId, userId });
        const userRoles = await prisma_1.default.userRole.findMany({
            where: {
                organizationId,
                userId,
                deletedAt: null,
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        // Flatten and deduplicate permissions
        const permissionSet = new Set();
        const permissions = [];
        userRoles.forEach(userRole => {
            userRole.role.permissions.forEach(rp => {
                if (!permissionSet.has(rp.permissionId)) {
                    permissionSet.add(rp.permissionId);
                    permissions.push(rp.permission);
                }
            });
        });
        return permissions;
    }
    /**
     * Check if user has permission
     */
    async hasPermission(organizationId, userId, permissionKey) {
        logger_1.default.debug('Checking user permission', { organizationId, userId, permissionKey });
        const result = await prisma_1.default.userRole.findFirst({
            where: {
                organizationId,
                userId,
                deletedAt: null,
                role: {
                    permissions: {
                        some: {
                            permission: {
                                key: permissionKey,
                                organizationId,
                                deletedAt: null,
                            },
                        },
                    },
                },
            },
        });
        return !!result;
    }
    /**
     * Check if user has any of the permissions
     */
    async hasAnyPermission(organizationId, userId, permissionKeys) {
        const result = await prisma_1.default.userRole.findFirst({
            where: {
                organizationId,
                userId,
                deletedAt: null,
                role: {
                    permissions: {
                        some: {
                            permission: {
                                key: { in: permissionKeys },
                                organizationId,
                                deletedAt: null,
                            },
                        },
                    },
                },
            },
        });
        return !!result;
    }
    /**
     * Check if user has all permissions
     */
    async hasAllPermissions(organizationId, userId, permissionKeys) {
        const permissions = await this.getUserPermissions(organizationId, userId);
        const userPermissionKeys = permissions.map(p => p.key);
        return permissionKeys.every(key => userPermissionKeys.includes(key));
    }
}
exports.UserRoleRepository = UserRoleRepository;
exports.userRoleRepository = new UserRoleRepository();
