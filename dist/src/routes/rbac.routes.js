"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const rbac_validators_1 = require("../validators/rbac.validators");
const rbac_controller_1 = require("../controllers/rbac.controller");
const router = (0, express_1.Router)();
// All RBAC routes require authentication
router.use(auth_middleware_1.requireAuth);
// ===== PERMISSION ROUTES =====
/**
 * POST /api/v1/rbac/permissions
 * Create a new permission
 */
router.post('/permissions', (0, validation_1.validate)({ body: rbac_validators_1.createPermissionSchema }), rbac_controller_1.createPermission);
/**
 * GET /api/v1/rbac/permissions
 * List permissions for organization
 */
router.get('/permissions', (0, validation_1.validate)({ query: rbac_validators_1.permissionQuerySchema }), rbac_controller_1.listPermissions);
/**
 * GET /api/v1/rbac/permissions/:permissionId
 * Get permission by ID
 */
router.get('/permissions/:permissionId', (0, validation_1.validate)({ params: rbac_validators_1.permissionIdSchema }), rbac_controller_1.getPermission);
/**
 * PUT /api/v1/rbac/permissions/:permissionId
 * Update permission
 */
router.put('/permissions/:permissionId', (0, validation_1.validate)({ params: rbac_validators_1.permissionIdSchema, body: rbac_validators_1.updatePermissionSchema }), rbac_controller_1.updatePermission);
/**
 * DELETE /api/v1/rbac/permissions/:permissionId
 * Delete permission
 */
router.delete('/permissions/:permissionId', (0, validation_1.validate)({ params: rbac_validators_1.permissionIdSchema }), rbac_controller_1.deletePermission);
// ===== ROLE ROUTES =====
/**
 * POST /api/v1/rbac/roles
 * Create a new role
 */
router.post('/roles', (0, validation_1.validate)({ body: rbac_validators_1.createRoleSchema }), rbac_controller_1.createRole);
/**
 * GET /api/v1/rbac/roles
 * List roles for organization
 */
router.get('/roles', (0, validation_1.validate)({ query: rbac_validators_1.roleQuerySchema }), rbac_controller_1.listRoles);
/**
 * GET /api/v1/rbac/roles/:roleId
 * Get role by ID
 */
router.get('/roles/:roleId', (0, validation_1.validate)({ params: rbac_validators_1.roleIdSchema }), rbac_controller_1.getRole);
/**
 * PUT /api/v1/rbac/roles/:roleId
 * Update role
 */
router.put('/roles/:roleId', (0, validation_1.validate)({ params: rbac_validators_1.roleIdSchema, body: rbac_validators_1.updateRoleSchema }), rbac_controller_1.updateRole);
/**
 * DELETE /api/v1/rbac/roles/:roleId
 * Delete role
 */
router.delete('/roles/:roleId', (0, validation_1.validate)({ params: rbac_validators_1.roleIdSchema }), rbac_controller_1.deleteRole);
/**
 * POST /api/v1/rbac/roles/:roleId/clone
 * Clone role
 */
router.post('/roles/:roleId/clone', (0, validation_1.validate)({ params: rbac_validators_1.roleIdSchema, body: rbac_validators_1.cloneRoleSchema }), rbac_controller_1.cloneRole);
// ===== ROLE PERMISSION MANAGEMENT =====
/**
 * POST /api/v1/rbac/roles/:roleId/permissions
 * Assign single permission to role
 */
router.post('/roles/:roleId/permissions', (0, validation_1.validate)({ params: rbac_validators_1.roleIdSchema, body: rbac_validators_1.assignPermissionToRoleSchema }), rbac_controller_1.assignPermissionToRole);
/**
 * PUT /api/v1/rbac/roles/:roleId/permissions
 * Assign multiple permissions to role
 */
router.put('/roles/:roleId/permissions', (0, validation_1.validate)({ params: rbac_validators_1.roleIdSchema, body: rbac_validators_1.assignPermissionsToRoleSchema }), rbac_controller_1.assignPermissionsToRole);
/**
 * DELETE /api/v1/rbac/roles/:roleId/permissions/:permissionId
 * Remove permission from role
 */
router.delete('/roles/:roleId/permissions/:permissionId', (0, validation_1.validate)({
    params: rbac_validators_1.roleIdSchema.merge(rbac_validators_1.permissionIdSchema),
}), rbac_controller_1.removePermissionFromRole);
// ===== USER ROLE ASSIGNMENT =====
/**
 * POST /api/v1/rbac/users/:userId/roles
 * Assign role to user
 */
router.post('/users/roles/assign', (0, validation_1.validate)({ body: rbac_validators_1.assignRoleToUserSchema }), rbac_controller_1.assignRoleToUser);
/**
 * DELETE /api/v1/rbac/users/:userId/roles
 * Remove role from user
 */
router.delete('/users/roles/remove', (0, validation_1.validate)({ body: rbac_validators_1.removeRoleFromUserSchema }), rbac_controller_1.removeRoleFromUser);
/**
 * PUT /api/v1/rbac/users/:userId/roles
 * Replace user roles
 */
router.put('/users/roles/replace', (0, validation_1.validate)({ body: rbac_validators_1.replaceUserRolesSchema }), rbac_controller_1.replaceUserRoles);
/**
 * GET /api/v1/rbac/users/:userId/roles
 * Get user roles
 */
router.get('/users/:userId/roles', rbac_controller_1.getUserRoles);
/**
 * GET /api/v1/rbac/users/:userId/permissions
 * Get user permissions
 */
router.get('/users/:userId/permissions', rbac_controller_1.getUserPermissions);
exports.default = router;
