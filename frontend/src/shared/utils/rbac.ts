import { Permission, UserRole } from '@/types'

/**
 * Check if a user has a specific permission (by key or legacy display name).
 */
export const hasPermission = (userPermissions: Permission[], permission: string): boolean => {
  return userPermissions.some(p => p.key === permission || p.name === permission)
}

/**
 * Check if a user has any of the given permissions
 */
export const hasAnyPermission = (userPermissions: Permission[], permissions: string[]): boolean => {
  return permissions.some(p => hasPermission(userPermissions, p))
}

/**
 * Check if a user has all of the given permissions
 */
export const hasAllPermissions = (
  userPermissions: Permission[],
  permissions: string[]
): boolean => {
  return permissions.every(p => hasPermission(userPermissions, p))
}

/**
 * Get permission identifiers from a list of permissions (keys preferred).
 */
export const getPermissionNames = (permissions: Permission[]): string[] => {
  return permissions.flatMap(p => [p.key, p.name].filter((value): value is string => Boolean(value)))
}

/**
 * Role identifiers for RBAC checks (prefers role key, falls back to display name).
 */
export const getRoleIdentifiers = (userRoles: UserRole[]): string[] => {
  return userRoles
    .flatMap(r => [r.role?.key, r.role?.name])
    .filter((value): value is string => Boolean(value))
}

/**
 * Check if a user has a specific role by key or display name.
 */
export const hasRole = (userRoles: UserRole[], roleIdentifier: string): boolean => {
  return getRoleIdentifiers(userRoles).includes(roleIdentifier)
}

/**
 * Get role display names from user roles.
 */
export const getRoleNames = (userRoles: UserRole[]): string[] => {
  return userRoles.map(r => r.role?.name).filter((name): name is string => !!name)
}

const ADMIN_ROLE_IDENTIFIERS = [
  'super_admin',
  'organization_admin',
  'organization_owner',
  'Super Admin',
  'Organization Admin',
  'Organization Owner',
]

/**
 * Check if user is admin (has any admin-like role).
 */
export const isAdmin = (userRoles: UserRole[]): boolean => {
  const identifiers = getRoleIdentifiers(userRoles)
  return ADMIN_ROLE_IDENTIFIERS.some(role => identifiers.includes(role))
}

/**
 * Check if user is owner
 */
export const isOwner = (userRoles: UserRole[]): boolean => {
  return hasRole(userRoles, 'organization_owner')
}

/**
 * Map permission identifiers to boolean values
 */
export const mapPermissions = (permissions: Permission[]): Record<string, boolean> => {
  return permissions.reduce(
    (acc, p) => {
      const identifier = p.key || p.name
      acc[identifier] = true
      return acc
    },
    {} as Record<string, boolean>
  )
}

/**
 * Filter permissions by prefix (e.g., 'rbac:' for all RBAC permissions)
 */
export const filterPermissionsByPrefix = (
  permissions: Permission[],
  prefix: string
): Permission[] => {
  return permissions.filter(p => (p.key || p.name).startsWith(prefix))
}
