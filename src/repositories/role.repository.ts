import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';

/**
 * Role Repository
 * Handles all role-related database operations
 */
export class RoleRepository {
  /**
   * Create a new role
   */
  async create(data: {
    organizationId: string;
    name: string;
    key: string;
    description?: string;
    isDefault?: boolean;
    createdBy?: string;
  }) {
    logger.debug('Creating role', { organizationId: data.organizationId, key: data.key });
    
    return prisma.role.create({
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
  async findById(id: string) {
    logger.debug('Finding role by ID', { id });
    
    return prisma.role.findUnique({
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
  async findByOrganizationAndKey(organizationId: string, key: string) {
    logger.debug('Finding role by organization and key', { organizationId, key });
    
    return prisma.role.findUnique({
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
  async findByOrganization(organizationId: string, skip: number = 0, take: number = 100) {
    logger.debug('Finding roles by organization', { organizationId, skip, take });
    
    return prisma.role.findMany({
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
  async search(organizationId: string, query: string, skip: number = 0, take: number = 100) {
    logger.debug('Searching roles', { organizationId, query, skip, take });
    
    return prisma.role.findMany({
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
  async update(id: string, data: Partial<{
    name: string;
    description: string;
    updatedBy: string;
  }>) {
    logger.debug('Updating role', { id });
    
    return prisma.role.update({
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
  async delete(id: string, deletedBy?: string) {
    logger.debug('Deleting role', { id });
    
    return prisma.role.update({
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
  async countByOrganization(organizationId: string) {
    return prisma.role.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Check if role is default
   */
  async isDefault(roleId: string) {
    const role = await this.findById(roleId);
    return !!role && role.isDefault;
  }

  /**
   * Get default roles for organization
   */
  async getDefaultRoles(organizationId: string) {
    return prisma.role.findMany({
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
  async clone(roleId: string, newName: string, newKey: string, organizationId: string, clonedBy?: string) {
    logger.debug('Cloning role', { roleId, newKey });
    
    const sourceRole = await this.findById(roleId);
    if (!sourceRole) {
      throw new Error('Source role not found');
    }

    // Create new role
    const newRole = await prisma.role.create({
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
      await prisma.rolePermission.createMany({
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
  async assignPermission(roleId: string, permissionId: string) {
    logger.debug('Assigning permission to role', { roleId, permissionId });
    
    return prisma.rolePermission.create({
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
  async removePermission(roleId: string, permissionId: string) {
    logger.debug('Removing permission from role', { roleId, permissionId });
    
    return prisma.rolePermission.delete({
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
  async hasPermission(roleId: string, permissionId: string) {
    const rp = await prisma.rolePermission.findUnique({
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
  async getPermissions(roleId: string) {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });
  }

  /**
   * Assign multiple permissions to role
   */
  async assignPermissions(roleId: string, permissionIds: string[]) {
    logger.debug('Assigning multiple permissions to role', { roleId, permissionIds });
    
    // Remove existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Add new permissions
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId,
          permissionId,
        })),
      });
    }

    return this.findById(roleId);
  }
}

export const roleRepository = new RoleRepository();
