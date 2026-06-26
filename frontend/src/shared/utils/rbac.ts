import { Permission, UserRole } from '@/types'

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (userPermissions: Permission[], permissionName: string): boolean => {
  return userPermissions.some(p => p.name === permissionName)
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
export const hasAllPermissions = (userPermissions: Permission[], permissions: string[]): boolean => {
  return permissions.every(p => hasPermission(userPermissions, p))
}

/**
 * Get permission names from a list of permissions
 */
export const getPermissionNames = (permissions: Permission[]): string[] => {
  return permissions.map(p => p.name)
}

/**
 * Check if a user has a specific role
 */
export const hasRole = (userRoles: UserRole[], roleName: string): boolean => {
  return userRoles.some(r => r.role?.name === roleName)
}

/**
 * Get role names from user roles
 */
export const getRoleNames = (userRoles: UserRole[]): string[] => {
  return userRoles
    .map(r => r.role?.name)
    .filter((name): name is string => !!name)
}

/**
 * Check if user is admin (has any admin-like role)
 */
export const isAdmin = (userRoles: UserRole[]): boolean => {
  const roleNames = getRoleNames(userRoles)
  return roleNames.some(name =>
    ['super_admin', 'organization_admin', 'organization_owner'].includes(name)
  )
}

/**
 * Check if user is owner
 */
export const isOwner = (userRoles: UserRole[]): boolean => {
  return hasRole(userRoles, 'organization_owner')
}

/**
 * Map permission names to boolean values
 */
export const mapPermissions = (permissions: Permission[]): Record<string, boolean> => {
  return permissions.reduce((acc, p) => {
    acc[p.name] = true
    return acc
  }, {} as Record<string, boolean>)
}

/**
 * Filter permissions by prefix (e.g., 'rbac:' for all RBAC permissions)
 */
export const filterPermissionsByPrefix = (permissions: Permission[], prefix: string): Permission[] => {
  return permissions.filter(p => p.name.startsWith(prefix))
}
