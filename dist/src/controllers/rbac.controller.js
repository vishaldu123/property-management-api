"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = exports.getUserRoles = exports.replaceUserRoles = exports.removeRoleFromUser = exports.assignRoleToUser = exports.assignPermissionsToRole = exports.removePermissionFromRole = exports.assignPermissionToRole = exports.cloneRole = exports.listRoles = exports.getRole = exports.deleteRole = exports.updateRole = exports.createRole = exports.listPermissions = exports.getPermission = exports.deletePermission = exports.updatePermission = exports.createPermission = void 0;
const response_1 = require("../shared/core/response");
const rbac_service_1 = require("../services/rbac.service");
const rbac_validators_1 = require("../validators/rbac.validators");
/**
 * Get actor context from authenticated request
 */
const getActorContext = (req) => {
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
const getPaginationSkip = (page, limit) => {
    return (page - 1) * limit;
};
// ===== PERMISSION CONTROLLERS =====
const createPermission = async (req, res, next) => {
    try {
        const context = getActorContext(req);
        const payload = rbac_validators_1.createPermissionSchema.parse(req.body);
        const permission = await rbac_service_1.rbacService.createPermission(context.organizationId, payload, context.userId);
        response_1.ApiResponse.created(res, permission, 'Permission created successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.createPermission = createPermission;
const updatePermission = async (req, res, next) => {
    try {
        const permissionId = req.params.permissionId;
        const payload = rbac_validators_1.updatePermissionSchema.parse(req.body);
        const context = getActorContext(req);
        const permission = await rbac_service_1.rbacService.updatePermission(permissionId, payload, context.userId);
        response_1.ApiResponse.success(res, permission, 'Permission updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updatePermission = updatePermission;
const deletePermission = async (req, res, next) => {
    try {
        const permissionId = req.params.permissionId;
        const context = getActorContext(req);
        const permission = await rbac_service_1.rbacService.deletePermission(permissionId, context.userId);
        response_1.ApiResponse.success(res, permission, 'Permission deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deletePermission = deletePermission;
const getPermission = async (req, res, next) => {
    try {
        const permissionId = req.params.permissionId;
        const permission = await rbac_service_1.rbacService.getPermission(permissionId);
        response_1.ApiResponse.success(res, permission, 'Permission retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getPermission = getPermission;
const listPermissions = async (req, res, next) => {
    try {
        const context = getActorContext(req);
        const query = rbac_validators_1.permissionQuerySchema.parse(req.query);
        const skip = getPaginationSkip(query.page, query.limit);
        let permissions;
        if (query.search) {
            permissions = await rbac_service_1.rbacService.searchPermissions(context.organizationId, query.search, skip, query.limit);
        }
        else {
            permissions = await rbac_service_1.rbacService.listPermissions(context.organizationId, skip, query.limit);
        }
        const total = await (query.search
            ? permission_repository_1.permissionRepository.countByOrganization(context.organizationId)
            : permission_repository_1.permissionRepository.countByOrganization(context.organizationId));
        response_1.ApiResponse.success(res, {
            data: permissions,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                pages: Math.ceil(total / query.limit),
            },
        }, 'Permissions retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.listPermissions = listPermissions;
// ===== ROLE CONTROLLERS =====
const createRole = async (req, res, next) => {
    try {
        const context = getActorContext(req);
        const payload = rbac_validators_1.createRoleSchema.parse(req.body);
        const role = await rbac_service_1.rbacService.createRole(context.organizationId, payload, context.userId);
        response_1.ApiResponse.created(res, role, 'Role created successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.createRole = createRole;
const updateRole = async (req, res, next) => {
    try {
        const roleId = req.params.roleId;
        const payload = rbac_validators_1.updateRoleSchema.parse(req.body);
        const context = getActorContext(req);
        const role = await rbac_service_1.rbacService.updateRole(roleId, payload, context.userId);
        response_1.ApiResponse.success(res, role, 'Role updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res, next) => {
    try {
        const roleId = req.params.roleId;
        const context = getActorContext(req);
        const role = await rbac_service_1.rbacService.deleteRole(roleId, context.userId);
        response_1.ApiResponse.success(res, role, 'Role deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRole = deleteRole;
const getRole = async (req, res, next) => {
    try {
        const roleId = req.params.roleId;
        const role = await rbac_service_1.rbacService.getRole(roleId);
        response_1.ApiResponse.success(res, role, 'Role retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getRole = getRole;
const listRoles = async (req, res, next) => {
    try {
        const context = getActorContext(req);
        const query = rbac_validators_1.roleQuerySchema.parse(req.query);
        const skip = getPaginationSkip(query.page, query.limit);
        let roles;
        if (query.search) {
            roles = await rbac_service_1.rbacService.searchRoles(context.organizationId, query.search, skip, query.limit);
        }
        else {
            roles = await rbac_service_1.rbacService.listRoles(context.organizationId, skip, query.limit);
        }
        const total = await role_repository_1.roleRepository.countByOrganization(context.organizationId);
        response_1.ApiResponse.success(res, {
            data: roles,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                pages: Math.ceil(total / query.limit),
            },
        }, 'Roles retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.listRoles = listRoles;
const cloneRole = async (req, res, next) => {
    try {
        const sourceRoleId = req.params.roleId;
        const payload = rbac_validators_1.cloneRoleSchema.parse(req.body);
        const context = getActorContext(req);
        const role = await rbac_service_1.rbacService.cloneRole(sourceRoleId, payload, context.organizationId, context.userId);
        response_1.ApiResponse.created(res, role, 'Role cloned successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.cloneRole = cloneRole;
// ===== ROLE PERMISSION MANAGEMENT =====
const assignPermissionToRole = async (req, res, next) => {
    try {
        const roleId = req.params.roleId;
        const payload = rbac_validators_1.assignPermissionToRoleSchema.parse(req.body);
        const context = getActorContext(req);
        const rolePermission = await rbac_service_1.rbacService.assignPermissionToRole(roleId, payload.permissionId, context.organizationId);
        response_1.ApiResponse.created(res, rolePermission, 'Permission assigned to role successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.assignPermissionToRole = assignPermissionToRole;
const removePermissionFromRole = async (req, res, next) => {
    try {
        const roleId = req.params.roleId;
        const permissionId = req.params.permissionId;
        const context = getActorContext(req);
        await rbac_service_1.rbacService.removePermissionFromRole(roleId, permissionId, context.organizationId);
        response_1.ApiResponse.success(res, {}, 'Permission removed from role successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.removePermissionFromRole = removePermissionFromRole;
const assignPermissionsToRole = async (req, res, next) => {
    try {
        const roleId = req.params.roleId;
        const payload = rbac_validators_1.assignPermissionsToRoleSchema.parse(req.body);
        const context = getActorContext(req);
        const role = await rbac_service_1.rbacService.assignPermissionsToRole(roleId, payload.permissionIds, context.organizationId);
        response_1.ApiResponse.success(res, role, 'Permissions assigned to role successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.assignPermissionsToRole = assignPermissionsToRole;
// ===== USER ROLE ASSIGNMENT =====
const assignRoleToUser = async (req, res, next) => {
    try {
        const payload = rbac_validators_1.assignRoleToUserSchema.parse(req.body);
        const context = getActorContext(req);
        const userRole = await rbac_service_1.rbacService.assignRoleToUser(context.organizationId, payload.userId, payload.roleId, context.userId);
        response_1.ApiResponse.created(res, userRole, 'Role assigned to user successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.assignRoleToUser = assignRoleToUser;
const removeRoleFromUser = async (req, res, next) => {
    try {
        const payload = rbac_validators_1.removeRoleFromUserSchema.parse(req.body);
        const context = getActorContext(req);
        await rbac_service_1.rbacService.removeRoleFromUser(context.organizationId, payload.userId, payload.roleId);
        response_1.ApiResponse.success(res, {}, 'Role removed from user successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.removeRoleFromUser = removeRoleFromUser;
const replaceUserRoles = async (req, res, next) => {
    try {
        const payload = rbac_validators_1.replaceUserRolesSchema.parse(req.body);
        const context = getActorContext(req);
        const userRoles = await rbac_service_1.rbacService.replaceUserRoles(context.organizationId, payload.userId, payload.roleIds, context.userId);
        response_1.ApiResponse.success(res, userRoles, 'User roles replaced successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.replaceUserRoles = replaceUserRoles;
const getUserRoles = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const context = getActorContext(req);
        const userRoles = await rbac_service_1.rbacService.getUserRoles(context.organizationId, userId);
        response_1.ApiResponse.success(res, userRoles, 'User roles retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getUserRoles = getUserRoles;
const getUserPermissions = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const context = getActorContext(req);
        const permissions = await rbac_service_1.rbacService.getUserPermissions(context.organizationId, userId);
        response_1.ApiResponse.success(res, permissions, 'User permissions retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getUserPermissions = getUserPermissions;
/**
 * Import repositories for pagination
 */
const permission_repository_1 = require("../repositories/permission.repository");
const role_repository_1 = require("../repositories/role.repository");
