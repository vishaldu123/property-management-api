import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';

/**
 * Permission Repository
 * Handles all permission-related database operations
 */
export class PermissionRepository {
  /**
   * Create a new permission
   */
  async create(data: {
    organizationId: string;
    key: string;
    name: string;
    description?: string;
    createdBy?: string;
  }) {
    logger.debug('Creating permission', { organizationId: data.organizationId, key: data.key });
    
    return prisma.permission.create({
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
  async findById(id: string) {
    logger.debug('Finding permission by ID', { id });
    
    return prisma.permission.findUnique({
      where: { id },
    });
  }

  /**
   * Find permission by organization and key
   */
  async findByOrganizationAndKey(organizationId: string, key: string) {
    logger.debug('Finding permission by organization and key', { organizationId, key });
    
    return prisma.permission.findUnique({
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
  async findByOrganization(organizationId: string, skip: number = 0, take: number = 100) {
    logger.debug('Finding permissions by organization', { organizationId, skip, take });
    
    return prisma.permission.findMany({
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
  async search(organizationId: string, query: string, skip: number = 0, take: number = 100) {
    logger.debug('Searching permissions', { organizationId, query, skip, take });
    
    return prisma.permission.findMany({
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
  async update(id: string, data: Partial<{
    name: string;
    description: string;
    updatedBy: string;
  }>) {
    logger.debug('Updating permission', { id });
    
    return prisma.permission.update({
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
  async delete(id: string, deletedBy?: string) {
    logger.debug('Deleting permission', { id });
    
    return prisma.permission.update({
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
  async countByOrganization(organizationId: string) {
    return prisma.permission.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Check if permission exists
   */
  async exists(organizationId: string, key: string) {
    const permission = await this.findByOrganizationAndKey(organizationId, key);
    return !!permission && !permission.deletedAt;
  }

  /**
   * Get permissions for roles
   */
  async getPermissionsForRoles(roleIds: string[]) {
    logger.debug('Getting permissions for roles', { roleIds });
    
    return prisma.permission.findMany({
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

export const permissionRepository = new PermissionRepository();
