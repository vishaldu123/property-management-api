import { useAuth } from './use-auth'
import { usePermissionGate } from './use-permission-gate'

/**
 * Hook for RBAC checks
 * Provides permission and role checking utilities
 */
export const useRbac = () => {
  const { user } = useAuth()
  const { canPerform, canPerformAny } = usePermissionGate()

  const getRoleNames = (): string[] => {
    if (!user) return []
    return user.roles?.map(r => r.role?.name).filter(Boolean) as string[]
  }

  const hasRole = (roleName: string): boolean => {
    return getRoleNames().includes(roleName)
  }

  const hasAnyRole = (roleNames: string[]): boolean => {
    const userRoles = getRoleNames()
    return roleNames.some(role => userRoles.includes(role))
  }

  const canManageMembers = (): boolean => {
    return hasAnyRole(['organization_owner', 'organization_admin'])
  }

  const canManageRbac = (): boolean => {
    return hasAnyRole(['organization_owner', 'organization_admin'])
  }

  const canManageProperties = (): boolean => {
    return canPerform('manage_properties') || hasAnyRole(['organization_owner', 'organization_admin'])
  }

  const canViewReport = (): boolean => {
    return canPerform('view_reports') || hasAnyRole(['organization_owner', 'organization_admin'])
  }

  return {
    user,
    getRoleNames,
    hasRole,
    hasAnyRole,
    canPerform,
    canPerformAny,
    canManageMembers,
    canManageRbac,
    canManageProperties,
    canViewReport,
  }
}
