import { useAuth } from './use-auth'
import { usePermissionGate } from './use-permission-gate'
import { getRoleIdentifiers, getRoleNames as getRoleDisplayNames } from '@/shared/utils/rbac'

/**
 * Hook for RBAC checks
 * Provides permission and role checking utilities
 */
export const useRbac = () => {
  const { user } = useAuth()
  const { canPerform, canPerformAny } = usePermissionGate()

  const getRoleNames = (): string[] => {
    if (!user?.roles) return []
    return getRoleDisplayNames(user.roles)
  }

  const getUserRoleIdentifiers = (): string[] => {
    if (!user?.roles) return []
    return getRoleIdentifiers(user.roles)
  }

  const hasRole = (roleIdentifier: string): boolean => {
    return getUserRoleIdentifiers().includes(roleIdentifier)
  }

  const hasAnyRole = (roleIdentifiers: string[]): boolean => {
    const identifiers = getUserRoleIdentifiers()
    return roleIdentifiers.some(role => identifiers.includes(role))
  }

  const canManageMembers = (): boolean => {
    return hasAnyRole(['organization_owner', 'organization_admin'])
  }

  const canManageRbac = (): boolean => {
    return hasAnyRole(['organization_owner', 'organization_admin'])
  }

  const canManageProperties = (): boolean => {
    return (
      canPerform('manage_properties') || hasAnyRole(['organization_owner', 'organization_admin'])
    )
  }

  const canViewReport = (): boolean => {
    return canPerform('view_reports') || hasAnyRole(['organization_owner', 'organization_admin'])
  }

  return {
    user,
    getRoleNames,
    getUserRoleIdentifiers,
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
