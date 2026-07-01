import { useAuth } from './use-auth'

/**
 * Hook for checking permissions in components
 * Provides canPerform and other permission utilities
 */
export const usePermissionGate = () => {
  const { user } = useAuth()

  const getUserPermissions = (): string[] => {
    if (!user) return []

    // Aggregate permissions from all roles in current organization
    const permissionSet = new Set<string>()

    user.roles?.forEach(userRole => {
      if (userRole.role?.permissions) {
        userRole.role.permissions.forEach(permission => {
          permissionSet.add(permission.key || permission.name)
        })
      }
    })

    return Array.from(permissionSet)
  }

  const permissions = getUserPermissions()

  return {
    permissions,
    canPerform: (permission: string): boolean => {
      return permissions.includes(permission)
    },
    canPerformAny: (permissions: string[]): boolean => {
      return permissions.some(p => getUserPermissions().includes(p))
    },
    canPerformAll: (permissions: string[]): boolean => {
      return permissions.every(p => getUserPermissions().includes(p))
    },
  }
}
