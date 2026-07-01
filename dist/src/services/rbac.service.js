"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacService = exports.RBACService = void 0;
const permission_repository_1 = require("../repositories/permission.repository");
const role_repository_1 = require("../repositories/role.repository");
const user_role_repository_1 = require("../repositories/user-role.repository");
const organization_repository_1 = require("../repositories/organization.repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * RBAC Service
 * Handles Role-Based Access Control operations
 */
class RBACService {
    /**
     * Validate permission format (resource:action)
     */
    validatePermissionFormat(key) {
        const permissionRegex = /^[a-z_]+:[a-z_]+$/i;
        return permissionRegex.test(key);
    }
    /**
     * Validate role key format
     */
    validateRoleKeyFormat(key) {
        const roleKeyRegex = /^[a-z_]+$/i;
        return roleKeyRegex.test(key);
    }
    // ===== PERMISSION MANAGEMENT =====
    /**
     * Create a new permission
     */
    async createPermission(organizationId, payload, createdBy) {
        logger_1.default.info('Creating permission', { organizationId, permissionKey: payload.key });
        // Verify organization exists
        const org = await organization_repository_1.organizationRepository.findById(organizationId);
        if (!org) {
            throw new errors_1.NotFoundError('Organization');
        }
        // Validate permission format
        if (!this.validatePermissionFormat(payload.key)) {
            throw new errors_1.ValidationError({ key: ['Permission key must be in format "resource:action"'] });
        }
        // Check for duplicate
        const existing = await permission_repository_1.permissionRepository.findByOrganizationAndKey(organizationId, payload.key);
        if (existing && !existing.deletedAt) {
            throw new errors_1.ConflictError('Permission already exists');
        }
        return permission_repository_1.permissionRepository.create({
            organizationId,
            key: payload.key,
            name: payload.name,
            description: payload.description,
            createdBy,
        });
    }
    /**
     * Update permission
     */
    async updatePermission(permissionId, payload, updatedBy) {
        logger_1.default.info('Updating permission', { permissionId });
        const permission = await permission_repository_1.permissionRepository.findById(permissionId);
        if (!permission || permission.deletedAt) {
            throw new errors_1.NotFoundError('Permission');
        }
        return permission_repository_1.permissionRepository.update(permissionId, {
            ...payload,
            updatedBy,
        });
    }
    /**
     * Delete permission
     */
    async deletePermission(permissionId, deletedBy) {
        logger_1.default.info('Deleting permission', { permissionId });
        const permission = await permission_repository_1.permissionRepository.findById(permissionId);
        if (!permission || permission.deletedAt) {
            throw new errors_1.NotFoundError('Permission');
        }
        return permission_repository_1.permissionRepository.delete(permissionId, deletedBy);
    }
    /**
     * Get permission by ID
     */
    async getPermission(permissionId) {
        const permission = await permission_repository_1.permissionRepository.findById(permissionId);
        if (!permission || permission.deletedAt) {
            throw new errors_1.NotFoundError('Permission');
        }
        return permission;
    }
    /**
     * List permissions for organization
     */
    async listPermissions(organizationId, skip = 0, take = 100) {
        return permission_repository_1.permissionRepository.findByOrganization(organizationId, skip, take);
    }
    /**
     * Search permissions
     */
    async searchPermissions(organizationId, query, skip = 0, take = 100) {
        return permission_repository_1.permissionRepository.search(organizationId, query, skip, take);
    }
    // ===== ROLE MANAGEMENT =====
    /**
     * Create a new role
     */
    async createRole(organizationId, payload, createdBy) {
        logger_1.default.info('Creating role', { organizationId, roleKey: payload.key });
        // Verify organization exists
        const org = await organization_repository_1.organizationRepository.findById(organizationId);
        if (!org) {
            throw new errors_1.NotFoundError('Organization');
        }
        // Validate role key format
        if (!this.validateRoleKeyFormat(payload.key)) {
            throw new errors_1.ValidationError({ key: ['Role key must contain only lowercase letters and underscores'] });
        }
        // Check for duplicate
        const existing = await role_repository_1.roleRepository.findByOrganizationAndKey(organizationId, payload.key);
        if (existing && !existing.deletedAt) {
            throw new errors_1.ConflictError('Role already exists');
        }
        return role_repository_1.roleRepository.create({
            organizationId,
            name: payload.name,
            key: payload.key,
            description: payload.description,
            isDefault: payload.isDefault || false,
            createdBy,
        });
    }
    /**
     * Update role
     */
    async updateRole(roleId, payload, updatedBy) {
        logger_1.default.info('Updating role', { roleId });
        const role = await role_repository_1.roleRepository.findById(roleId);
        if (!role || role.deletedAt) {
            throw new errors_1.NotFoundError('Role');
        }
        // System roles cannot be modified (only their permissions)
        if (role.isDefault) {
            throw new errors_1.ForbiddenError('System roles cannot be modified');
        }
        return role_repository_1.roleRepository.update(roleId, {
            ...payload,
            updatedBy,
        });
    }
    /**
     * Delete role
     */
    async deleteRole(roleId, deletedBy) {
        logger_1.default.info('Deleting role', { roleId });
        const role = await role_repository_1.roleRepository.findById(roleId);
        if (!role || role.deletedAt) {
            throw new errors_1.NotFoundError('Role');
        }
        // System roles cannot be deleted
        if (role.isDefault) {
            throw new errors_1.ForbiddenError('System roles cannot be deleted');
        }
        return role_repository_1.roleRepository.delete(roleId, deletedBy);
    }
    /**
     * Get role by ID
     */
    async getRole(roleId) {
        const role = await role_repository_1.roleRepository.findById(roleId);
        if (!role || role.deletedAt) {
            throw new errors_1.NotFoundError('Role');
        }
        return role;
    }
    /**
     * List roles for organization
     */
    async listRoles(organizationId, skip = 0, take = 100) {
        return role_repository_1.roleRepository.findByOrganization(organizationId, skip, take);
    }
    /**
     * Search roles
     */
    async searchRoles(organizationId, query, skip = 0, take = 100) {
        return role_repository_1.roleRepository.search(organizationId, query, skip, take);
    }
    /**
     * Clone role with all permissions
     */
    async cloneRole(roleId, payload, organizationId, clonedBy) {
        logger_1.default.info('Cloning role', { roleId, newKey: payload.key });
        const role = await role_repository_1.roleRepository.findById(roleId);
        if (!role || role.deletedAt) {
            throw new errors_1.NotFoundError('Role');
        }
        // Verify role belongs to organization
        if (role.organizationId !== organizationId) {
            throw new errors_1.ForbiddenError('Role does not belong to this organization');
        }
        // Check for duplicate key
        const existing = await role_repository_1.roleRepository.findByOrganizationAndKey(organizationId, payload.key);
        if (existing && !existing.deletedAt) {
            throw new errors_1.ConflictError('Role key already exists');
        }
        return role_repository_1.roleRepository.clone(roleId, payload.name, payload.key, organizationId, clonedBy);
    }
    /**
     * Assign permission to role
     */
    async assignPermissionToRole(roleId, permissionId, organizationId) {
        logger_1.default.info('Assigning permission to role', { roleId, permissionId });
        const role = await role_repository_1.roleRepository.findById(roleId);
        if (!role || role.deletedAt) {
            throw new errors_1.NotFoundError('Role');
        }
        const permission = await permission_repository_1.permissionRepository.findById(permissionId);
        if (!permission || permission.deletedAt) {
            throw new errors_1.NotFoundError('Permission');
        }
        // Verify both belong to same organization
        if (role.organizationId !== organizationId || permission.organizationId !== organizationId) {
            throw new errors_1.ForbiddenError('Role and permission must belong to the same organization');
        }
        // Check for duplicate assignment
        const hasPermission = await role_repository_1.roleRepository.hasPermission(roleId, permissionId);
        if (hasPermission) {
            throw new errors_1.ConflictError('Permission already assigned to role');
        }
        return role_repository_1.roleRepository.assignPermission(roleId, permissionId);
    }
    /**
     * Remove permission from role
     */
    async removePermissionFromRole(roleId, permissionId, organizationId) {
        logger_1.default.info('Removing permission from role', { roleId, permissionId });
        const role = await role_repository_1.roleRepository.findById(roleId);
        if (!role || role.deletedAt) {
            throw new errors_1.NotFoundError('Role');
        }
        // Verify role belongs to organization
        if (role.organizationId !== organizationId) {
            throw new errors_1.ForbiddenError('Role does not belong to this organization');
        }
        return role_repository_1.roleRepository.removePermission(roleId, permissionId);
    }
    /**
     * Assign multiple permissions to role
     */
    async assignPermissionsToRole(roleId, permissionIds, organizationId) {
        logger_1.default.info('Assigning multiple permissions to role', { roleId, permissionCount: permissionIds.length });
        const role = await role_repository_1.roleRepository.findById(roleId);
        if (!role || role.deletedAt) {
            throw new errors_1.NotFoundError('Role');
        }
        // Verify all permissions belong to same organization
        const permissions = await Promise.all(permissionIds.map(pid => permission_repository_1.permissionRepository.findById(pid)));
        for (const permission of permissions) {
            if (!permission || permission.deletedAt) {
                throw new errors_1.NotFoundError('Permission not found');
            }
            if (permission.organizationId !== organizationId) {
                throw new errors_1.ForbiddenError('All permissions must belong to the same organization');
            }
        }
        return role_repository_1.roleRepository.assignPermissions(roleId, permissionIds);
    }
    // ===== USER ROLE ASSIGNMENT =====
    /**
     * Assign role to user
     */
    async assignRoleToUser(organizationId, userId, roleId, assignedBy) {
        logger_1.default.info('Assigning role to user', { organizationId, userId, roleId });
        // Verify organization exists
        const org = await organization_repository_1.organizationRepository.findById(organizationId);
        if (!org) {
            throw new errors_1.NotFoundError('Organization');
        }
        // Verify role belongs to organization
        const role = await role_repository_1.roleRepository.findById(roleId);
        if (!role || role.deletedAt) {
            throw new errors_1.NotFoundError('Role');
        }
        if (role.organizationId !== organizationId) {
            throw new errors_1.ForbiddenError('Role does not belong to this organization');
        }
        // Check for duplicate assignment
        const hasDuplicate = await user_role_repository_1.userRoleRepository.hasDuplicate(organizationId, userId, roleId);
        if (hasDuplicate) {
            throw new errors_1.ConflictError('User already has this role');
        }
        return user_role_repository_1.userRoleRepository.assignRole({
            organizationId,
            userId,
            roleId,
            assignedBy,
        });
    }
    /**
     * Remove role from user
     */
    async removeRoleFromUser(organizationId, userId, roleId) {
        logger_1.default.info('Removing role from user', { organizationId, userId, roleId });
        const hasRole = await user_role_repository_1.userRoleRepository.hasRole(organizationId, userId, roleId);
        if (!hasRole) {
            throw new errors_1.NotFoundError('User does not have this role');
        }
        return user_role_repository_1.userRoleRepository.removeRole(organizationId, userId, roleId);
    }
    /**
     * Replace all user roles
     */
    async replaceUserRoles(organizationId, userId, roleIds, replacedBy) {
        logger_1.default.info('Replacing user roles', { organizationId, userId, roleCount: roleIds.length });
        // Verify organization exists
        const org = await organization_repository_1.organizationRepository.findById(organizationId);
        if (!org) {
            throw new errors_1.NotFoundError('Organization');
        }
        // Verify all roles belong to organization
        const roles = await Promise.all(roleIds.map(rid => role_repository_1.roleRepository.findById(rid)));
        for (const role of roles) {
            if (!role || role.deletedAt) {
                throw new errors_1.NotFoundError('Role not found');
            }
            if (role.organizationId !== organizationId) {
                throw new errors_1.ForbiddenError('All roles must belong to the same organization');
            }
        }
        return user_role_repository_1.userRoleRepository.replaceRoles(organizationId, userId, roleIds, replacedBy);
    }
    /**
     * Get user roles
     */
    async getUserRoles(organizationId, userId) {
        return user_role_repository_1.userRoleRepository.getUserRoles(organizationId, userId);
    }
    /**
     * Check if user has role by key
     */
    async userHasRoleByKey(organizationId, userId, roleKey) {
        return user_role_repository_1.userRoleRepository.hasRoleByKey(organizationId, userId, roleKey);
    }
    /**
     * Check if user has permission
     */
    async userHasPermission(organizationId, userId, permissionKey) {
        return user_role_repository_1.userRoleRepository.hasPermission(organizationId, userId, permissionKey);
    }
    /**
     * Check if user has any permission
     */
    async userHasAnyPermission(organizationId, userId, permissionKeys) {
        return user_role_repository_1.userRoleRepository.hasAnyPermission(organizationId, userId, permissionKeys);
    }
    /**
     * Check if user has all permissions
     */
    async userHasAllPermissions(organizationId, userId, permissionKeys) {
        return user_role_repository_1.userRoleRepository.hasAllPermissions(organizationId, userId, permissionKeys);
    }
    /**
     * Get user permissions
     */
    async getUserPermissions(organizationId, userId) {
        return user_role_repository_1.userRoleRepository.getUserPermissions(organizationId, userId);
    }
    // ===== SYSTEM ROLES SEEDING =====
    /**
     * Ensure an organization has RBAC roles and the user has an appropriate role assigned.
     * Repairs legacy orgs created before RBAC bootstrap on registration.
     */
    async ensureOrganizationBootstrap(organizationId, userId) {
        const roleCount = await role_repository_1.roleRepository.countByOrganization(organizationId);
        let ownerRoleId;
        if (roleCount === 0) {
            const seeded = await this.seedSystemRoles(organizationId, userId);
            ownerRoleId = seeded.roles.get('organization_owner');
        }
        else {
            const ownerRole = await role_repository_1.roleRepository.findByOrganizationAndKey(organizationId, 'organization_owner');
            ownerRoleId = ownerRole?.id;
        }
        const existingUserRoles = await user_role_repository_1.userRoleRepository.getUserRoles(organizationId, userId);
        if (existingUserRoles.length > 0) {
            return;
        }
        const membership = await prisma_1.default.organizationUser.findFirst({
            where: {
                organizationId,
                userId,
                deletedAt: null,
            },
        });
        let roleKey = 'staff';
        if (membership?.role === 'OWNER' || membership?.isOwner) {
            roleKey = 'organization_owner';
        }
        else if (membership?.role === 'ADMIN') {
            roleKey = 'organization_admin';
        }
        let roleId = roleKey === 'organization_owner' ? ownerRoleId : undefined;
        if (!roleId) {
            const role = await role_repository_1.roleRepository.findByOrganizationAndKey(organizationId, roleKey);
            roleId = role?.id;
        }
        if (!roleId) {
            logger_1.default.warn('Unable to assign bootstrap role — role not found', {
                organizationId,
                userId,
                roleKey,
            });
            return;
        }
        const hasDuplicate = await user_role_repository_1.userRoleRepository.hasDuplicate(organizationId, userId, roleId);
        if (!hasDuplicate) {
            await user_role_repository_1.userRoleRepository.assignRole({
                organizationId,
                userId,
                roleId,
                assignedBy: userId,
            });
            logger_1.default.info('Assigned bootstrap RBAC role to user', { organizationId, userId, roleKey });
        }
    }
    /**
     * Seed default system roles and permissions
     */
    async seedSystemRoles(organizationId, seedBy) {
        logger_1.default.info('Seeding system roles and permissions', { organizationId });
        // Define system permissions
        const systemPermissions = [
            // Organization permissions
            { key: 'organization:view', name: 'View Organization' },
            { key: 'organization:update', name: 'Update Organization' },
            { key: 'organization:delete', name: 'Delete Organization' },
            { key: 'organization:invite_members', name: 'Invite Members' },
            { key: 'organization:manage_members', name: 'Manage Members' },
            { key: 'organization:manage_roles', name: 'Manage Roles' },
            { key: 'organization:manage_permissions', name: 'Manage Permissions' },
            { key: 'organization:manage_settings', name: 'Manage Settings' },
            // Property permissions
            { key: 'property:create', name: 'Create Property' },
            { key: 'property:view', name: 'View Property' },
            { key: 'property:update', name: 'Update Property' },
            { key: 'property:delete', name: 'Delete Property' },
            // Unit permissions
            { key: 'unit:create', name: 'Create Unit' },
            { key: 'unit:view', name: 'View Unit' },
            { key: 'unit:update', name: 'Update Unit' },
            { key: 'unit:delete', name: 'Delete Unit' },
            // Tenant permissions
            { key: 'tenant:create', name: 'Create Tenant' },
            { key: 'tenant:view', name: 'View Tenant' },
            { key: 'tenant:update', name: 'Update Tenant' },
            { key: 'tenant:delete', name: 'Delete Tenant' },
            // Lease permissions
            { key: 'lease:create', name: 'Create Lease' },
            { key: 'lease:view', name: 'View Lease' },
            { key: 'lease:update', name: 'Update Lease' },
            { key: 'lease:delete', name: 'Delete Lease' },
            // Payment permissions
            { key: 'payment:create', name: 'Create Payment' },
            { key: 'payment:view', name: 'View Payment' },
            { key: 'payment:update', name: 'Update Payment' },
            { key: 'payment:delete', name: 'Delete Payment' },
            { key: 'payment:initiate', name: 'Initiate Payment' },
            // Maintenance permissions
            { key: 'maintenance:create', name: 'Create Maintenance' },
            { key: 'maintenance:view', name: 'View Maintenance' },
            { key: 'maintenance:update', name: 'Update Maintenance' },
            { key: 'maintenance:assign', name: 'Assign Maintenance' },
        ];
        // Create permissions
        const permissionsMap = new Map();
        for (const perm of systemPermissions) {
            const existing = await permission_repository_1.permissionRepository.findByOrganizationAndKey(organizationId, perm.key);
            if (!existing || existing.deletedAt) {
                const created = await permission_repository_1.permissionRepository.create({
                    organizationId,
                    ...perm,
                    createdBy: seedBy,
                });
                permissionsMap.set(perm.key, created.id);
            }
            else {
                permissionsMap.set(perm.key, existing.id);
            }
        }
        // Define system roles with their permissions
        const systemRoles = [
            {
                key: 'super_admin',
                name: 'Super Admin',
                permissions: Array.from(permissionsMap.values()),
            },
            {
                key: 'organization_owner',
                name: 'Organization Owner',
                permissions: Array.from(permissionsMap.values()),
            },
            {
                key: 'organization_admin',
                name: 'Organization Admin',
                permissions: Array.from(permissionsMap.values()),
            },
            {
                key: 'property_manager',
                name: 'Property Manager',
                permissions: [
                    permissionsMap.get('property:view'),
                    permissionsMap.get('property:update'),
                    permissionsMap.get('unit:create'),
                    permissionsMap.get('unit:view'),
                    permissionsMap.get('unit:update'),
                    permissionsMap.get('unit:delete'),
                    permissionsMap.get('tenant:view'),
                    permissionsMap.get('lease:view'),
                    permissionsMap.get('lease:update'),
                    permissionsMap.get('maintenance:create'),
                    permissionsMap.get('maintenance:view'),
                    permissionsMap.get('maintenance:assign'),
                ].filter(Boolean),
            },
            {
                key: 'accountant',
                name: 'Accountant',
                permissions: [
                    permissionsMap.get('property:view'),
                    permissionsMap.get('unit:view'),
                    permissionsMap.get('tenant:view'),
                    permissionsMap.get('lease:view'),
                    permissionsMap.get('payment:create'),
                    permissionsMap.get('payment:view'),
                    permissionsMap.get('payment:update'),
                    permissionsMap.get('payment:initiate'),
                ].filter(Boolean),
            },
            {
                key: 'maintenance_manager',
                name: 'Maintenance Manager',
                permissions: [
                    permissionsMap.get('property:view'),
                    permissionsMap.get('unit:view'),
                    permissionsMap.get('maintenance:create'),
                    permissionsMap.get('maintenance:view'),
                    permissionsMap.get('maintenance:update'),
                    permissionsMap.get('maintenance:assign'),
                ].filter(Boolean),
            },
            {
                key: 'staff',
                name: 'Staff',
                permissions: [
                    permissionsMap.get('property:view'),
                    permissionsMap.get('unit:view'),
                    permissionsMap.get('tenant:view'),
                    permissionsMap.get('lease:view'),
                    permissionsMap.get('maintenance:view'),
                ].filter(Boolean),
            },
            {
                key: 'read_only',
                name: 'Read Only',
                permissions: [
                    permissionsMap.get('property:view'),
                    permissionsMap.get('unit:view'),
                    permissionsMap.get('tenant:view'),
                    permissionsMap.get('lease:view'),
                ].filter(Boolean),
            },
        ];
        // Create roles
        const rolesMap = new Map();
        for (const roleData of systemRoles) {
            const existing = await role_repository_1.roleRepository.findByOrganizationAndKey(organizationId, roleData.key);
            let role;
            if (!existing || existing.deletedAt) {
                role = await role_repository_1.roleRepository.create({
                    organizationId,
                    key: roleData.key,
                    name: roleData.name,
                    isDefault: true,
                    createdBy: seedBy,
                });
            }
            else {
                role = existing;
            }
            rolesMap.set(roleData.key, role.id);
            // Assign permissions to role
            await role_repository_1.roleRepository.assignPermissions(role.id, roleData.permissions);
        }
        logger_1.default.info('System roles seeded successfully', { organizationId, rolesCount: systemRoles.length });
        return {
            permissions: permissionsMap,
            roles: rolesMap,
        };
    }
}
exports.RBACService = RBACService;
exports.rbacService = new RBACService();
