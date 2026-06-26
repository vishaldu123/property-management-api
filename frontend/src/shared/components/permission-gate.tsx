import React from 'react'
import { Permission } from '@/types'
import { hasPermission, hasAllPermissions, hasAnyPermission } from '@/shared/utils/rbac'

interface PermissionGateProps {
  userPermissions: Permission[]
  requires?: 'all' | 'any'
  permissions: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * PermissionGate component for role-based UI rendering
 * Conditionally renders children based on user permissions
 *
 * @example
 * // Single permission
 * <PermissionGate permissions="user:read" userPermissions={permissions}>
 *   <Dashboard />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (requires all)
 * <PermissionGate
 *   permissions={['user:create', 'user:delete']}
 *   userPermissions={permissions}
 *   requires="all"
 * >
 *   <AdminPanel />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (requires any)
 * <PermissionGate
 *   permissions={['user:edit', 'user:delete']}
 *   userPermissions={permissions}
 *   requires="any"
 * >
 *   <ModerateButton />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  userPermissions,
  requires = 'any',
  permissions,
  children,
  fallback,
}) => {
  const permissionList = Array.isArray(permissions) ? permissions : [permissions]

  let hasAccess = false

  if (requires === 'all') {
    hasAccess = hasAllPermissions(userPermissions, permissionList)
  } else {
    hasAccess = permissionList.length === 1
      ? hasPermission(userPermissions, permissionList[0])
      : hasAnyPermission(userPermissions, permissionList)
  }

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

interface RoleGateProps {
  userRoles: string[]
  requires?: 'all' | 'any'
  roles: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * RoleGate component for role-based UI rendering
 * Conditionally renders children based on user roles
 *
 * @example
 * // Single role
 * <RoleGate roles="admin" userRoles={roles}>
 *   <AdminPanel />
 * </RoleGate>
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  userRoles,
  requires = 'any',
  roles,
  children,
  fallback,
}) => {
  const roleList = Array.isArray(roles) ? roles : [roles]

  let hasAccess = false

  if (requires === 'all') {
    hasAccess = roleList.every(role => userRoles.includes(role))
  } else {
    hasAccess = roleList.some(role => userRoles.includes(role))
  }

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
