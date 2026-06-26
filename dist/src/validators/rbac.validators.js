"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleQuerySchema = exports.permissionQuerySchema = exports.userIdSchema = exports.replaceUserRolesSchema = exports.removeRoleFromUserSchema = exports.assignRoleToUserSchema = exports.assignPermissionsToRoleSchema = exports.removePermissionFromRoleSchema = exports.assignPermissionToRoleSchema = exports.roleIdSchema = exports.cloneRoleSchema = exports.updateRoleSchema = exports.createRoleSchema = exports.permissionIdSchema = exports.updatePermissionSchema = exports.createPermissionSchema = void 0;
const zod_1 = require("zod");
/**
 * Permission Validators
 */
exports.createPermissionSchema = zod_1.z.object({
    key: zod_1.z
        .string()
        .min(3, 'Permission key must be at least 3 characters')
        .max(100, 'Permission key must not exceed 100 characters')
        .regex(/^[a-z_]+:[a-z_]+$/i, 'Permission key must be in format "resource:action"'),
    name: zod_1.z
        .string()
        .min(2, 'Permission name must be at least 2 characters')
        .max(255, 'Permission name must not exceed 255 characters'),
    description: zod_1.z
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
        .optional(),
});
exports.updatePermissionSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Permission name must be at least 2 characters')
        .max(255, 'Permission name must not exceed 255 characters')
        .optional(),
    description: zod_1.z
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
        .optional(),
});
exports.permissionIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid permission ID'),
});
/**
 * Role Validators
 */
exports.createRoleSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Role name must be at least 2 characters')
        .max(255, 'Role name must not exceed 255 characters'),
    key: zod_1.z
        .string()
        .min(2, 'Role key must be at least 2 characters')
        .max(100, 'Role key must not exceed 100 characters')
        .regex(/^[a-z_]+$/i, 'Role key must contain only lowercase letters and underscores'),
    description: zod_1.z
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
        .optional(),
});
exports.updateRoleSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Role name must be at least 2 characters')
        .max(255, 'Role name must not exceed 255 characters')
        .optional(),
    description: zod_1.z
        .string()
        .max(1000, 'Description must not exceed 1000 characters')
        .optional(),
});
exports.cloneRoleSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Role name must be at least 2 characters')
        .max(255, 'Role name must not exceed 255 characters'),
    key: zod_1.z
        .string()
        .min(2, 'Role key must be at least 2 characters')
        .max(100, 'Role key must not exceed 100 characters')
        .regex(/^[a-z_]+$/i, 'Role key must contain only lowercase letters and underscores'),
});
exports.roleIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid role ID'),
});
exports.assignPermissionToRoleSchema = zod_1.z.object({
    permissionId: zod_1.z.string().uuid('Invalid permission ID'),
});
exports.removePermissionFromRoleSchema = zod_1.z.object({
    permissionId: zod_1.z.string().uuid('Invalid permission ID'),
});
exports.assignPermissionsToRoleSchema = zod_1.z.object({
    permissionIds: zod_1.z
        .array(zod_1.z.string().uuid('Invalid permission ID'))
        .min(1, 'At least one permission must be provided'),
});
/**
 * User Role Assignment Validators
 */
exports.assignRoleToUserSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
    roleId: zod_1.z.string().uuid('Invalid role ID'),
});
exports.removeRoleFromUserSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
    roleId: zod_1.z.string().uuid('Invalid role ID'),
});
exports.replaceUserRolesSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
    roleIds: zod_1.z
        .array(zod_1.z.string().uuid('Invalid role ID'))
        .min(1, 'At least one role must be provided'),
});
exports.userIdSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
});
/**
 * Query Validators
 */
exports.permissionQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
    search: zod_1.z.string().optional(),
    sort: zod_1.z.enum(['asc', 'desc']).optional(),
});
exports.roleQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
    search: zod_1.z.string().optional(),
    sort: zod_1.z.enum(['asc', 'desc']).optional(),
});
