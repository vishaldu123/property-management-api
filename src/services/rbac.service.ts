import { permissionRepository } from '../repositories/permission.repository';
import { roleRepository } from '../repositories/role.repository';
import { userRoleRepository } from '../repositories/user-role.repository';
import { organizationRepository } from '../repositories/organization.repository';
import prisma from '../config/prisma';
import { ConflictError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * RBAC Service
 * Handles Role-Based Access Control operations
 */
export class RBACService {
  /**
   * Validate permission format (resource:action)
   */
  private validatePermissionFormat(key: string): boolean {
    const permissionRegex = /^[a-z_]+:[a-z_]+$/i;
    return permissionRegex.test(key);
  }

  /**
   * Validate role key format
   */
  private validateRoleKeyFormat(key: string): boolean {
    const roleKeyRegex = /^[a-z_]+$/i;
    return roleKeyRegex.test(key);
  }

  // ===== PERMISSION MANAGEMENT =====

  /**
   * Create a new permission
   */
  async createPermission(
    organizationId: string,
    payload: {
      key: string;
      name: string;
      description?: string;
    },
    createdBy: string
  ) {
    logger.info('Creating permission', { organizationId, permissionKey: payload.key });

    // Verify organization exists
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization');
    }

    // Validate permission format
    if (!this.validatePermissionFormat(payload.key)) {
      throw new ValidationError({ key: ['Permission key must be in format "resource:action"'] });
    }

    // Check for duplicate
    const existing = await permissionRepository.findByOrganizationAndKey(organizationId, payload.key);
    if (existing && !existing.deletedAt) {
      throw new ConflictError('Permission already exists');
    }

    return permissionRepository.create({
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
  async updatePermission(
    permissionId: string,
    payload: {
      name?: string;
      description?: string;
    },
    updatedBy: string
  ) {
    logger.info('Updating permission', { permissionId });

    const permission = await permissionRepository.findById(permissionId);
    if (!permission || permission.deletedAt) {
      throw new NotFoundError('Permission');
    }

    return permissionRepository.update(permissionId, {
      ...payload,
      updatedBy,
    });
  }

  /**
   * Delete permission
   */
  async deletePermission(permissionId: string, deletedBy: string) {
    logger.info('Deleting permission', { permissionId });

    const permission = await permissionRepository.findById(permissionId);
    if (!permission || permission.deletedAt) {
      throw new NotFoundError('Permission');
    }

    return permissionRepository.delete(permissionId, deletedBy);
  }

  /**
   * Get permission by ID
   */
  async getPermission(permissionId: string) {
    const permission = await permissionRepository.findById(permissionId);
    if (!permission || permission.deletedAt) {
      throw new NotFoundError('Permission');
    }
    return permission;
  }

  /**
   * List permissions for organization
   */
  async listPermissions(organizationId: string, skip: number = 0, take: number = 100) {
    return permissionRepository.findByOrganization(organizationId, skip, take);
  }

  /**
   * Search permissions
   */
  async searchPermissions(organizationId: string, query: string, skip: number = 0, take: number = 100) {
    return permissionRepository.search(organizationId, query, skip, take);
  }

  // ===== ROLE MANAGEMENT =====

  /**
   * Create a new role
   */
  async createRole(
    organizationId: string,
    payload: {
      name: string;
      key: string;
      description?: string;
      isDefault?: boolean;
    },
    createdBy: string
  ) {
    logger.info('Creating role', { organizationId, roleKey: payload.key });

    // Verify organization exists
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization');
    }

    // Validate role key format
    if (!this.validateRoleKeyFormat(payload.key)) {
      throw new ValidationError({ key: ['Role key must contain only lowercase letters and underscores'] });
    }

    // Check for duplicate
    const existing = await roleRepository.findByOrganizationAndKey(organizationId, payload.key);
    if (existing && !existing.deletedAt) {
      throw new ConflictError('Role already exists');
    }

    return roleRepository.create({
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
  async updateRole(
    roleId: string,
    payload: {
      name?: string;
      description?: string;
    },
    updatedBy: string
  ) {
    logger.info('Updating role', { roleId });

    const role = await roleRepository.findById(roleId);
    if (!role || role.deletedAt) {
      throw new NotFoundError('Role');
    }

    // System roles cannot be modified (only their permissions)
    if (role.isDefault) {
      throw new ForbiddenError('System roles cannot be modified');
    }

    return roleRepository.update(roleId, {
      ...payload,
      updatedBy,
    });
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string, deletedBy: string) {
    logger.info('Deleting role', { roleId });

    const role = await roleRepository.findById(roleId);
    if (!role || role.deletedAt) {
      throw new NotFoundError('Role');
    }

    // System roles cannot be deleted
    if (role.isDefault) {
      throw new ForbiddenError('System roles cannot be deleted');
    }

    return roleRepository.delete(roleId, deletedBy);
  }

  /**
   * Get role by ID
   */
  async getRole(roleId: string) {
    const role = await roleRepository.findById(roleId);
    if (!role || role.deletedAt) {
      throw new NotFoundError('Role');
    }
    return role;
  }

  /**
   * List roles for organization
   */
  async listRoles(organizationId: string, skip: number = 0, take: number = 100) {
    return roleRepository.findByOrganization(organizationId, skip, take);
  }

  /**
   * Search roles
   */
  async searchRoles(organizationId: string, query: string, skip: number = 0, take: number = 100) {
    return roleRepository.search(organizationId, query, skip, take);
  }

  /**
   * Clone role with all permissions
   */
  async cloneRole(
    roleId: string,
    payload: {
      name: string;
      key: string;
    },
    organizationId: string,
    clonedBy: string
  ) {
    logger.info('Cloning role', { roleId, newKey: payload.key });

    const role = await roleRepository.findById(roleId);
    if (!role || role.deletedAt) {
      throw new NotFoundError('Role');
    }

    // Verify role belongs to organization
    if (role.organizationId !== organizationId) {
      throw new ForbiddenError('Role does not belong to this organization');
    }

    // Check for duplicate key
    const existing = await roleRepository.findByOrganizationAndKey(organizationId, payload.key);
    if (existing && !existing.deletedAt) {
      throw new ConflictError('Role key already exists');
    }

    return roleRepository.clone(roleId, payload.name, payload.key, organizationId, clonedBy);
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(roleId: string, permissionId: string, organizationId: string) {
    logger.info('Assigning permission to role', { roleId, permissionId });

    const role = await roleRepository.findById(roleId);
    if (!role || role.deletedAt) {
      throw new NotFoundError('Role');
    }

    const permission = await permissionRepository.findById(permissionId);
    if (!permission || permission.deletedAt) {
      throw new NotFoundError('Permission');
    }

    // Verify both belong to same organization
    if (role.organizationId !== organizationId || permission.organizationId !== organizationId) {
      throw new ForbiddenError('Role and permission must belong to the same organization');
    }

    // Check for duplicate assignment
    const hasPermission = await roleRepository.hasPermission(roleId, permissionId);
    if (hasPermission) {
      throw new ConflictError('Permission already assigned to role');
    }

    return roleRepository.assignPermission(roleId, permissionId);
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId: string, permissionId: string, organizationId: string) {
    logger.info('Removing permission from role', { roleId, permissionId });

    const role = await roleRepository.findById(roleId);
    if (!role || role.deletedAt) {
      throw new NotFoundError('Role');
    }

    // Verify role belongs to organization
    if (role.organizationId !== organizationId) {
      throw new ForbiddenError('Role does not belong to this organization');
    }

    return roleRepository.removePermission(roleId, permissionId);
  }

  /**
   * Assign multiple permissions to role
   */
  async assignPermissionsToRole(roleId: string, permissionIds: string[], organizationId: string) {
    logger.info('Assigning multiple permissions to role', { roleId, permissionCount: permissionIds.length });

    const role = await roleRepository.findById(roleId);
    if (!role || role.deletedAt) {
      throw new NotFoundError('Role');
    }

    // Verify all permissions belong to same organization
    const permissions = await Promise.all(
      permissionIds.map(pid => permissionRepository.findById(pid))
    );

    for (const permission of permissions) {
      if (!permission || permission.deletedAt) {
        throw new NotFoundError('Permission not found');
      }
      if (permission.organizationId !== organizationId) {
        throw new ForbiddenError('All permissions must belong to the same organization');
      }
    }

    return roleRepository.assignPermissions(roleId, permissionIds);
  }

  // ===== USER ROLE ASSIGNMENT =====

  /**
   * Assign role to user
   */
  async assignRoleToUser(
    organizationId: string,
    userId: string,
    roleId: string,
    assignedBy: string
  ) {
    logger.info('Assigning role to user', { organizationId, userId, roleId });

    // Verify organization exists
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization');
    }

    // Verify role belongs to organization
    const role = await roleRepository.findById(roleId);
    if (!role || role.deletedAt) {
      throw new NotFoundError('Role');
    }
    if (role.organizationId !== organizationId) {
      throw new ForbiddenError('Role does not belong to this organization');
    }

    // Check for duplicate assignment
    const hasDuplicate = await userRoleRepository.hasDuplicate(organizationId, userId, roleId);
    if (hasDuplicate) {
      throw new ConflictError('User already has this role');
    }

    return userRoleRepository.assignRole({
      organizationId,
      userId,
      roleId,
      assignedBy,
    });
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(organizationId: string, userId: string, roleId: string) {
    logger.info('Removing role from user', { organizationId, userId, roleId });

    const hasRole = await userRoleRepository.hasRole(organizationId, userId, roleId);
    if (!hasRole) {
      throw new NotFoundError('User does not have this role');
    }

    return userRoleRepository.removeRole(organizationId, userId, roleId);
  }

  /**
   * Replace all user roles
   */
  async replaceUserRoles(
    organizationId: string,
    userId: string,
    roleIds: string[],
    replacedBy: string
  ) {
    logger.info('Replacing user roles', { organizationId, userId, roleCount: roleIds.length });

    // Verify organization exists
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization');
    }

    // Verify all roles belong to organization
    const roles = await Promise.all(
      roleIds.map(rid => roleRepository.findById(rid))
    );

    for (const role of roles) {
      if (!role || role.deletedAt) {
        throw new NotFoundError('Role not found');
      }
      if (role.organizationId !== organizationId) {
        throw new ForbiddenError('All roles must belong to the same organization');
      }
    }

    return userRoleRepository.replaceRoles(organizationId, userId, roleIds, replacedBy);
  }

  /**
   * Get user roles
   */
  async getUserRoles(organizationId: string, userId: string) {
    return userRoleRepository.getUserRoles(organizationId, userId);
  }

  /**
   * Check if user has role by key
   */
  async userHasRoleByKey(organizationId: string, userId: string, roleKey: string) {
    return userRoleRepository.hasRoleByKey(organizationId, userId, roleKey);
  }

  /**
   * Check if user has permission
   */
  async userHasPermission(organizationId: string, userId: string, permissionKey: string) {
    return userRoleRepository.hasPermission(organizationId, userId, permissionKey);
  }

  /**
   * Check if user has any permission
   */
  async userHasAnyPermission(organizationId: string, userId: string, permissionKeys: string[]) {
    return userRoleRepository.hasAnyPermission(organizationId, userId, permissionKeys);
  }

  /**
   * Check if user has all permissions
   */
  async userHasAllPermissions(organizationId: string, userId: string, permissionKeys: string[]) {
    return userRoleRepository.hasAllPermissions(organizationId, userId, permissionKeys);
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(organizationId: string, userId: string) {
    return userRoleRepository.getUserPermissions(organizationId, userId);
  }

  // ===== SYSTEM ROLES SEEDING =====

  /**
   * Ensure an organization has RBAC roles and the user has an appropriate role assigned.
   * Repairs legacy orgs created before RBAC bootstrap on registration.
   */
  async ensureOrganizationBootstrap(organizationId: string, userId: string): Promise<void> {
    const roleCount = await roleRepository.countByOrganization(organizationId);
    let ownerRoleId: string | undefined;

    if (roleCount === 0) {
      const seeded = await this.seedSystemRoles(organizationId, userId);
      ownerRoleId = seeded.roles.get('organization_owner');
    } else {
      const ownerRole = await roleRepository.findByOrganizationAndKey(
        organizationId,
        'organization_owner'
      );
      ownerRoleId = ownerRole?.id;
    }

    const existingUserRoles = await userRoleRepository.getUserRoles(organizationId, userId);
    if (existingUserRoles.length > 0) {
      return;
    }

    const membership = await prisma.organizationUser.findFirst({
      where: {
        organizationId,
        userId,
        deletedAt: null,
      },
    });
    let roleKey = 'staff';
    if (membership?.role === 'OWNER' || membership?.isOwner) {
      roleKey = 'organization_owner';
    } else if (membership?.role === 'ADMIN') {
      roleKey = 'organization_admin';
    }

    let roleId = roleKey === 'organization_owner' ? ownerRoleId : undefined;
    if (!roleId) {
      const role = await roleRepository.findByOrganizationAndKey(organizationId, roleKey);
      roleId = role?.id;
    }

    if (!roleId) {
      logger.warn('Unable to assign bootstrap role — role not found', {
        organizationId,
        userId,
        roleKey,
      });
      return;
    }

    const hasDuplicate = await userRoleRepository.hasDuplicate(organizationId, userId, roleId);
    if (!hasDuplicate) {
      await userRoleRepository.assignRole({
        organizationId,
        userId,
        roleId,
        assignedBy: userId,
      });
      logger.info('Assigned bootstrap RBAC role to user', { organizationId, userId, roleKey });
    }
  }

  /**
   * Seed default system roles and permissions
   */
  async seedSystemRoles(organizationId: string, seedBy: string) {
    logger.info('Seeding system roles and permissions', { organizationId });

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
    const permissionsMap = new Map<string, any>();
    for (const perm of systemPermissions) {
      const existing = await permissionRepository.findByOrganizationAndKey(organizationId, perm.key);
      if (!existing || existing.deletedAt) {
        const created = await permissionRepository.create({
          organizationId,
          ...perm,
          createdBy: seedBy,
        });
        permissionsMap.set(perm.key, created.id);
      } else {
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
    const rolesMap = new Map<string, any>();
    for (const roleData of systemRoles) {
      const existing = await roleRepository.findByOrganizationAndKey(organizationId, roleData.key);
      let role: any;
      if (!existing || existing.deletedAt) {
        role = await roleRepository.create({
          organizationId,
          key: roleData.key,
          name: roleData.name,
          isDefault: true,
          createdBy: seedBy,
        });
      } else {
        role = existing;
      }
      rolesMap.set(roleData.key, role.id);

      // Assign permissions to role
      await roleRepository.assignPermissions(role.id, roleData.permissions);
    }

    logger.info('System roles seeded successfully', { organizationId, rolesCount: systemRoles.length });

    return {
      permissions: permissionsMap,
      roles: rolesMap,
    };
  }
}

export const rbacService = new RBACService();

