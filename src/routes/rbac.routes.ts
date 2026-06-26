import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole, requireOrganizationOwnership, organizationScope } from '../middleware/authorization.middleware';
import { validate } from '../utils/validation';
import {
  createPermissionSchema,
  updatePermissionSchema,
  permissionIdSchema,
  createRoleSchema,
  updateRoleSchema,
  cloneRoleSchema,
  roleIdSchema,
  assignPermissionToRoleSchema,
  removePermissionFromRoleSchema,
  assignPermissionsToRoleSchema,
  assignRoleToUserSchema,
  removeRoleFromUserSchema,
  replaceUserRolesSchema,
  permissionQuerySchema,
  roleQuerySchema,
} from '../validators/rbac.validators';
import {
  // Permission controllers
  createPermission,
  updatePermission,
  deletePermission,
  getPermission,
  listPermissions,
  // Role controllers
  createRole,
  updateRole,
  deleteRole,
  getRole,
  listRoles,
  cloneRole,
  // Role Permission controllers
  assignPermissionToRole,
  removePermissionFromRole,
  assignPermissionsToRole,
  // User Role Assignment controllers
  assignRoleToUser,
  removeRoleFromUser,
  replaceUserRoles,
  getUserRoles,
  getUserPermissions,
} from '../controllers/rbac.controller';

const router = Router();

// All RBAC routes require authentication
router.use(requireAuth);

// ===== PERMISSION ROUTES =====

/**
 * POST /api/v1/rbac/permissions
 * Create a new permission
 */
router.post(
  '/permissions',
  validate({ body: createPermissionSchema }),
  createPermission
);

/**
 * GET /api/v1/rbac/permissions
 * List permissions for organization
 */
router.get(
  '/permissions',
  validate({ query: permissionQuerySchema }),
  listPermissions
);

/**
 * GET /api/v1/rbac/permissions/:permissionId
 * Get permission by ID
 */
router.get(
  '/permissions/:permissionId',
  validate({ params: permissionIdSchema }),
  getPermission
);

/**
 * PUT /api/v1/rbac/permissions/:permissionId
 * Update permission
 */
router.put(
  '/permissions/:permissionId',
  validate({ params: permissionIdSchema, body: updatePermissionSchema }),
  updatePermission
);

/**
 * DELETE /api/v1/rbac/permissions/:permissionId
 * Delete permission
 */
router.delete(
  '/permissions/:permissionId',
  validate({ params: permissionIdSchema }),
  deletePermission
);

// ===== ROLE ROUTES =====

/**
 * POST /api/v1/rbac/roles
 * Create a new role
 */
router.post(
  '/roles',
  validate({ body: createRoleSchema }),
  createRole
);

/**
 * GET /api/v1/rbac/roles
 * List roles for organization
 */
router.get(
  '/roles',
  validate({ query: roleQuerySchema }),
  listRoles
);

/**
 * GET /api/v1/rbac/roles/:roleId
 * Get role by ID
 */
router.get(
  '/roles/:roleId',
  validate({ params: roleIdSchema }),
  getRole
);

/**
 * PUT /api/v1/rbac/roles/:roleId
 * Update role
 */
router.put(
  '/roles/:roleId',
  validate({ params: roleIdSchema, body: updateRoleSchema }),
  updateRole
);

/**
 * DELETE /api/v1/rbac/roles/:roleId
 * Delete role
 */
router.delete(
  '/roles/:roleId',
  validate({ params: roleIdSchema }),
  deleteRole
);

/**
 * POST /api/v1/rbac/roles/:roleId/clone
 * Clone role
 */
router.post(
  '/roles/:roleId/clone',
  validate({ params: roleIdSchema, body: cloneRoleSchema }),
  cloneRole
);

// ===== ROLE PERMISSION MANAGEMENT =====

/**
 * POST /api/v1/rbac/roles/:roleId/permissions
 * Assign single permission to role
 */
router.post(
  '/roles/:roleId/permissions',
  validate({ params: roleIdSchema, body: assignPermissionToRoleSchema }),
  assignPermissionToRole
);

/**
 * PUT /api/v1/rbac/roles/:roleId/permissions
 * Assign multiple permissions to role
 */
router.put(
  '/roles/:roleId/permissions',
  validate({ params: roleIdSchema, body: assignPermissionsToRoleSchema }),
  assignPermissionsToRole
);

/**
 * DELETE /api/v1/rbac/roles/:roleId/permissions/:permissionId
 * Remove permission from role
 */
router.delete(
  '/roles/:roleId/permissions/:permissionId',
  validate({
    params: roleIdSchema.merge(permissionIdSchema),
  }),
  removePermissionFromRole
);

// ===== USER ROLE ASSIGNMENT =====

/**
 * POST /api/v1/rbac/users/:userId/roles
 * Assign role to user
 */
router.post(
  '/users/roles/assign',
  validate({ body: assignRoleToUserSchema }),
  assignRoleToUser
);

/**
 * DELETE /api/v1/rbac/users/:userId/roles
 * Remove role from user
 */
router.delete(
  '/users/roles/remove',
  validate({ body: removeRoleFromUserSchema }),
  removeRoleFromUser
);

/**
 * PUT /api/v1/rbac/users/:userId/roles
 * Replace user roles
 */
router.put(
  '/users/roles/replace',
  validate({ body: replaceUserRolesSchema }),
  replaceUserRoles
);

/**
 * GET /api/v1/rbac/users/:userId/roles
 * Get user roles
 */
router.get(
  '/users/:userId/roles',
  getUserRoles
);

/**
 * GET /api/v1/rbac/users/:userId/permissions
 * Get user permissions
 */
router.get(
  '/users/:userId/permissions',
  getUserPermissions
);

export default router;
