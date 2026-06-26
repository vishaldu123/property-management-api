import { z } from 'zod';
import { ValidationSchemas } from '../shared/validation';

/**
 * Permission Validators
 */

export const createPermissionSchema = z.object({
  key: z
    .string()
    .min(3, 'Permission key must be at least 3 characters')
    .max(100, 'Permission key must not exceed 100 characters')
    .regex(/^[a-z_]+:[a-z_]+$/i, 'Permission key must be in format "resource:action"'),
  name: z
    .string()
    .min(2, 'Permission name must be at least 2 characters')
    .max(255, 'Permission name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;

export const updatePermissionSchema = z.object({
  name: z
    .string()
    .min(2, 'Permission name must be at least 2 characters')
    .max(255, 'Permission name must not exceed 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
});

export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;

export const permissionIdSchema = z.object({
  id: z.string().uuid('Invalid permission ID'),
});

export type PermissionIdInput = z.infer<typeof permissionIdSchema>;

/**
 * Role Validators
 */

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(255, 'Role name must not exceed 255 characters'),
  key: z
    .string()
    .min(2, 'Role key must be at least 2 characters')
    .max(100, 'Role key must not exceed 100 characters')
    .regex(/^[a-z_]+$/i, 'Role key must contain only lowercase letters and underscores'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(255, 'Role name must not exceed 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const cloneRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(255, 'Role name must not exceed 255 characters'),
  key: z
    .string()
    .min(2, 'Role key must be at least 2 characters')
    .max(100, 'Role key must not exceed 100 characters')
    .regex(/^[a-z_]+$/i, 'Role key must contain only lowercase letters and underscores'),
});

export type CloneRoleInput = z.infer<typeof cloneRoleSchema>;

export const roleIdSchema = z.object({
  id: z.string().uuid('Invalid role ID'),
});

export type RoleIdInput = z.infer<typeof roleIdSchema>;

export const assignPermissionToRoleSchema = z.object({
  permissionId: z.string().uuid('Invalid permission ID'),
});

export type AssignPermissionToRoleInput = z.infer<typeof assignPermissionToRoleSchema>;

export const removePermissionFromRoleSchema = z.object({
  permissionId: z.string().uuid('Invalid permission ID'),
});

export type RemovePermissionFromRoleInput = z.infer<typeof removePermissionFromRoleSchema>;

export const assignPermissionsToRoleSchema = z.object({
  permissionIds: z
    .array(z.string().uuid('Invalid permission ID'))
    .min(1, 'At least one permission must be provided'),
});

export type AssignPermissionsToRoleInput = z.infer<typeof assignPermissionsToRoleSchema>;

/**
 * User Role Assignment Validators
 */

export const assignRoleToUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  roleId: z.string().uuid('Invalid role ID'),
});

export type AssignRoleToUserInput = z.infer<typeof assignRoleToUserSchema>;

export const removeRoleFromUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  roleId: z.string().uuid('Invalid role ID'),
});

export type RemoveRoleFromUserInput = z.infer<typeof removeRoleFromUserSchema>;

export const replaceUserRolesSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  roleIds: z
    .array(z.string().uuid('Invalid role ID'))
    .min(1, 'At least one role must be provided'),
});

export type ReplaceUserRolesInput = z.infer<typeof replaceUserRolesSchema>;

export const userIdSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type UserIdInput = z.infer<typeof userIdSchema>;

/**
 * Query Validators
 */

export const permissionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});

export type PermissionQueryInput = z.infer<typeof permissionQuerySchema>;

export const roleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});

export type RoleQueryInput = z.infer<typeof roleQuerySchema>;
