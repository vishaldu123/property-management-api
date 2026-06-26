import prisma from '../config/prisma';
import logger from '../utils/logger';

/**
 * User Role Repository
 * Handles user role assignment and retrieval
 */
export class UserRoleRepository {
  /**
   * Assign a role to a user
   */
  async assignRole(data: {
    organizationId: string;
    userId: string;
    roleId: string;
    assignedBy?: string;
  }) {
    logger.debug('Assigning role to user', {
      organizationId: data.organizationId,
      userId: data.userId,
      roleId: data.roleId,
    });

    return prisma.userRole.create({
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
  async removeRole(organizationId: string, userId: string, roleId: string) {
    logger.debug('Removing role from user', { organizationId, userId, roleId });

    return prisma.userRole.delete({
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
  async replaceRoles(
    organizationId: string,
    userId: string,
    roleIds: string[],
    replacedBy?: string
  ) {
    logger.debug('Replacing user roles', { organizationId, userId, roleIds });

    // Soft delete existing roles
    await prisma.userRole.updateMany(
      {
        where: {
          organizationId,
          userId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          updatedBy: replacedBy,
        },
      }
    );

    // Create new roles
    if (roleIds.length > 0) {
      await prisma.userRole.createMany({
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
  async getUserRoles(organizationId: string, userId: string) {
    logger.debug('Getting user roles', { organizationId, userId });

    return prisma.userRole.findMany({
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
  async hasRole(organizationId: string, userId: string, roleId: string) {
    const userRole = await prisma.userRole.findUnique({
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
  async hasRoleByKey(organizationId: string, userId: string, roleKey: string) {
    const userRole = await prisma.userRole.findFirst({
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
  async getUserRoleKeys(organizationId: string, userId: string) {
    const userRoles = await prisma.userRole.findMany({
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
  async getUsersWithRole(organizationId: string, roleId: string, skip: number = 0, take: number = 100) {
    logger.debug('Getting users with role', { organizationId, roleId, skip, take });

    return prisma.userRole.findMany({
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
  async countUsersWithRole(organizationId: string, roleId: string) {
    return prisma.userRole.count({
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
  async hasDuplicate(organizationId: string, userId: string, roleId: string) {
    const userRole = await prisma.userRole.findUnique({
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
  async getRoleAssignment(organizationId: string, userId: string, roleId: string) {
    return prisma.userRole.findUnique({
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
  async getUserPermissions(organizationId: string, userId: string) {
    logger.debug('Getting user permissions', { organizationId, userId });

    const userRoles = await prisma.userRole.findMany({
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
    const permissionSet = new Set<string>();
    const permissions: any[] = [];

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
  async hasPermission(organizationId: string, userId: string, permissionKey: string) {
    logger.debug('Checking user permission', { organizationId, userId, permissionKey });

    const result = await prisma.userRole.findFirst({
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
  async hasAnyPermission(organizationId: string, userId: string, permissionKeys: string[]) {
    const result = await prisma.userRole.findFirst({
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
  async hasAllPermissions(organizationId: string, userId: string, permissionKeys: string[]) {
    const permissions = await this.getUserPermissions(organizationId, userId);
    const userPermissionKeys = permissions.map(p => p.key);
    return permissionKeys.every(key => userPermissionKeys.includes(key));
  }
}

export const userRoleRepository = new UserRoleRepository();
