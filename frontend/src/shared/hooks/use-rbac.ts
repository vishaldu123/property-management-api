import { useQueryClient } from '@tanstack/react-query'
import { rbacService } from '@/shared/services'
import { useMutationWithToast, useQueryWithToast } from './use-query-with-toast'

const RBAC_QUERY_KEY = 'rbac'
const PERMISSIONS_KEY = [RBAC_QUERY_KEY, 'permissions']
const ROLES_KEY = [RBAC_QUERY_KEY, 'roles']
const USER_PERMISSIONS_KEY = [RBAC_QUERY_KEY, 'user-permissions']

export const usePermissions = (
  organizationId: string | undefined,
  page = 1,
  limit = 50,
  search?: string,
  enabled = true
) => {
  return useQueryWithToast({
    queryKey: [...PERMISSIONS_KEY, organizationId, page, limit, search],
    queryFn: () => rbacService.listPermissions(organizationId!, page, limit, search),
    enabled: !!organizationId && enabled,
  })
}

export const useRoles = (
  organizationId: string | undefined,
  page = 1,
  limit = 50,
  search?: string,
  enabled = true
) => {
  return useQueryWithToast({
    queryKey: [...ROLES_KEY, organizationId, page, limit, search],
    queryFn: () => rbacService.listRoles(organizationId!, page, limit, search),
    enabled: !!organizationId && enabled,
  })
}

export const useRole = (roleId: string | undefined, enabled = true) => {
  return useQueryWithToast({
    queryKey: [...ROLES_KEY, roleId],
    queryFn: () => rbacService.getRole(roleId!),
    enabled: !!roleId && enabled,
  })
}

export const useUserRoles = (userId: string | undefined, enabled = true) => {
  return useQueryWithToast({
    queryKey: [...RBAC_QUERY_KEY, 'user-roles', userId],
    queryFn: () => rbacService.getUserRoles(userId!),
    enabled: !!userId && enabled,
  })
}

export const useUserPermissions = (userId: string | undefined, enabled = true) => {
  return useQueryWithToast({
    queryKey: [...USER_PERMISSIONS_KEY, userId],
    queryFn: () => rbacService.getUserPermissions(userId!),
    enabled: !!userId && enabled,
  })
}

export const useCheckPermission = (userId: string | undefined, permission: string | undefined) => {
  return useQueryWithToast({
    queryKey: [RBAC_QUERY_KEY, 'check-permission', userId, permission],
    queryFn: () => rbacService.hasPermission(userId!, permission!),
    enabled: !!userId && !!permission,
  })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ organizationId, data }: { organizationId: string; data: Parameters<typeof rbacService.createRole>[1] }) =>
        rbacService.createRole(organizationId, data),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [...ROLES_KEY, variables.organizationId] })
      },
    },
    { successMessage: 'Role created successfully' }
  )
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ roleId, data }: { roleId: string; data: Parameters<typeof rbacService.updateRole>[1] }) =>
        rbacService.updateRole(roleId, data),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ROLES_KEY })
        queryClient.setQueryData([...ROLES_KEY, data.id], data)
      },
    },
    { successMessage: 'Role updated successfully' }
  )
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: rbacService.deleteRole,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ROLES_KEY })
      },
    },
    { successMessage: 'Role deleted successfully' }
  )
}

export const useAssignPermissionToRole = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
        rbacService.assignPermissionToRole(roleId, permissionId),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...ROLES_KEY, data.id] })
      },
    },
    { successMessage: 'Permission assigned successfully' }
  )
}

export const useAssignPermissionsToRole = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
        rbacService.assignPermissionsToRole(roleId, permissionIds),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...ROLES_KEY, data.id] })
      },
    },
    { successMessage: 'Permissions assigned successfully' }
  )
}

export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
        rbacService.removePermissionFromRole(roleId, permissionId),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...ROLES_KEY, data.id] })
      },
    },
    { successMessage: 'Permission removed successfully' }
  )
}

export const useAssignRoleToUser = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ userId, organizationId, roleId }: { userId: string; organizationId: string; roleId: string }) =>
        rbacService.assignRoleToUser(userId, organizationId, roleId),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [...RBAC_QUERY_KEY, 'user-roles', data.userId] })
        queryClient.invalidateQueries({ queryKey: [...USER_PERMISSIONS_KEY, data.userId] })
      },
    },
    { successMessage: 'Role assigned to user successfully' }
  )
}

export const useRemoveRoleFromUser = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ userId, organizationId, roleId }: { userId: string; organizationId: string; roleId: string }) =>
        rbacService.removeRoleFromUser(userId, organizationId, roleId),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [...RBAC_QUERY_KEY, 'user-roles', variables.userId] })
        queryClient.invalidateQueries({ queryKey: [...USER_PERMISSIONS_KEY, variables.userId] })
      },
    },
    { successMessage: 'Role removed from user successfully' }
  )
}

export const useReplaceUserRoles = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ userId, organizationId, roleIds }: { userId: string; organizationId: string; roleIds: string[] }) =>
        rbacService.replaceUserRoles(userId, organizationId, roleIds),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [...RBAC_QUERY_KEY, 'user-roles', variables.userId] })
        queryClient.invalidateQueries({ queryKey: [...USER_PERMISSIONS_KEY, variables.userId] })
      },
    },
    { successMessage: 'User roles updated successfully' }
  )
}
