import { NextFunction, Response } from 'express';
import { ApiResponse } from '../shared/core/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { rbacService } from '../services/rbac.service';

import {
  createPermissionSchema,
  updatePermissionSchema,
  createRoleSchema,
  updateRoleSchema,
  cloneRoleSchema,
  assignPermissionToRoleSchema,
  assignPermissionsToRoleSchema,
  removePermissionFromRoleSchema,
  assignRoleToUserSchema,
  removeRoleFromUserSchema,
  replaceUserRolesSchema,
  permissionQuerySchema,
  roleQuerySchema,
} from '../validators/rbac.validators';

/**
 * Get actor context from authenticated request
 */
const getActorContext = (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new Error('User context not found');
  }

  return {
    userId: req.user.userId,
    organizationId: req.user.organizationId,
  };
};

/**
 * Calculate pagination skip value
 */
const getPaginationSkip = (page: number, limit: number) => {
  return (page - 1) * limit;
};

// ===== PERMISSION CONTROLLERS =====

export const createPermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const payload = createPermissionSchema.parse(req.body);

    const permission = await rbacService.createPermission(
      context.organizationId,
      payload,
      context.userId
    );

    ApiResponse.created(res, permission, 'Permission created successfully');
  } catch (error) {
    next(error);
  }
};

export const updatePermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissionId = req.params.permissionId as string;
    const payload = updatePermissionSchema.parse(req.body);
    const context = getActorContext(req);

    const permission = await rbacService.updatePermission(
      permissionId,
      payload,
      context.userId
    );

    ApiResponse.success(res, permission, 'Permission updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deletePermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissionId = req.params.permissionId as string;
    const context = getActorContext(req);

    const permission = await rbacService.deletePermission(permissionId, context.userId);

    ApiResponse.success(res, permission, 'Permission deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getPermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissionId = req.params.permissionId as string;

    const permission = await rbacService.getPermission(permissionId);

    ApiResponse.success(res, permission, 'Permission retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const listPermissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const query = permissionQuerySchema.parse(req.query);
    const skip = getPaginationSkip(query.page, query.limit);

    let permissions;
    if (query.search) {
      permissions = await rbacService.searchPermissions(
        context.organizationId,
        query.search,
        skip,
        query.limit
      );
    } else {
      permissions = await rbacService.listPermissions(context.organizationId, skip, query.limit);
    }

    const total = await (query.search
      ? permissionRepository.countByOrganization(context.organizationId)
      : permissionRepository.countByOrganization(context.organizationId));

    ApiResponse.success(
      res,
      {
        data: permissions,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages: Math.ceil(total / query.limit),
        },
      },
      'Permissions retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// ===== ROLE CONTROLLERS =====

export const createRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const payload = createRoleSchema.parse(req.body);

    const role = await rbacService.createRole(context.organizationId, payload, context.userId);

    ApiResponse.created(res, role, 'Role created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = req.params.roleId as string;
    const payload = updateRoleSchema.parse(req.body);
    const context = getActorContext(req);

    const role = await rbacService.updateRole(roleId, payload, context.userId);

    ApiResponse.success(res, role, 'Role updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = req.params.roleId as string;
    const context = getActorContext(req);

    const role = await rbacService.deleteRole(roleId, context.userId);

    ApiResponse.success(res, role, 'Role deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = req.params.roleId as string;

    const role = await rbacService.getRole(roleId);

    ApiResponse.success(res, role, 'Role retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const listRoles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const query = roleQuerySchema.parse(req.query);
    const skip = getPaginationSkip(query.page, query.limit);

    let roles;
    if (query.search) {
      roles = await rbacService.searchRoles(
        context.organizationId,
        query.search,
        skip,
        query.limit
      );
    } else {
      roles = await rbacService.listRoles(context.organizationId, skip, query.limit);
    }

    const total = await roleRepository.countByOrganization(context.organizationId);

    ApiResponse.success(
      res,
      {
        data: roles,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages: Math.ceil(total / query.limit),
        },
      },
      'Roles retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const cloneRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sourceRoleId = req.params.roleId as string;
    const payload = cloneRoleSchema.parse(req.body);
    const context = getActorContext(req);

    const role = await rbacService.cloneRole(sourceRoleId, payload, context.organizationId, context.userId);

    ApiResponse.created(res, role, 'Role cloned successfully');
  } catch (error) {
    next(error);
  }
};

// ===== ROLE PERMISSION MANAGEMENT =====

export const assignPermissionToRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = req.params.roleId as string;
    const payload = assignPermissionToRoleSchema.parse(req.body);
    const context = getActorContext(req);

    const rolePermission = await rbacService.assignPermissionToRole(
      roleId,
      payload.permissionId,
      context.organizationId
    );

    ApiResponse.created(res, rolePermission, 'Permission assigned to role successfully');
  } catch (error) {
    next(error);
  }
};

export const removePermissionFromRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = req.params.roleId as string;
    const permissionId = req.params.permissionId as string;
    const context = getActorContext(req);

    await rbacService.removePermissionFromRole(roleId, permissionId, context.organizationId);

    ApiResponse.success(res, {}, 'Permission removed from role successfully');
  } catch (error) {
    next(error);
  }
};

export const assignPermissionsToRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = req.params.roleId as string;
    const payload = assignPermissionsToRoleSchema.parse(req.body);
    const context = getActorContext(req);

    const role = await rbacService.assignPermissionsToRole(
      roleId,
      payload.permissionIds,
      context.organizationId
    );

    ApiResponse.success(res, role, 'Permissions assigned to role successfully');
  } catch (error) {
    next(error);
  }
};

// ===== USER ROLE ASSIGNMENT =====

export const assignRoleToUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = assignRoleToUserSchema.parse(req.body);
    const context = getActorContext(req);

    const userRole = await rbacService.assignRoleToUser(
      context.organizationId,
      payload.userId,
      payload.roleId,
      context.userId
    );

    ApiResponse.created(res, userRole, 'Role assigned to user successfully');
  } catch (error) {
    next(error);
  }
};

export const removeRoleFromUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = removeRoleFromUserSchema.parse(req.body);
    const context = getActorContext(req);

    await rbacService.removeRoleFromUser(context.organizationId, payload.userId, payload.roleId);

    ApiResponse.success(res, {}, 'Role removed from user successfully');
  } catch (error) {
    next(error);
  }
};

export const replaceUserRoles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = replaceUserRolesSchema.parse(req.body);
    const context = getActorContext(req);

    const userRoles = await rbacService.replaceUserRoles(
      context.organizationId,
      payload.userId,
      payload.roleIds,
      context.userId
    );

    ApiResponse.success(res, userRoles, 'User roles replaced successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserRoles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const context = getActorContext(req);

    const userRoles = await rbacService.getUserRoles(context.organizationId, userId);

    ApiResponse.success(res, userRoles, 'User roles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserPermissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const context = getActorContext(req);

    const permissions = await rbacService.getUserPermissions(context.organizationId, userId);

    ApiResponse.success(res, permissions, 'User permissions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Import repositories for pagination
 */
import { permissionRepository } from '../repositories/permission.repository';
import { roleRepository } from '../repositories/role.repository';
