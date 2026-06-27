import { apiClient } from './api-client'
import { Role, Permission, PaginatedResponse, UserRole } from '@/types'

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
}

export interface AssignPermissionToRoleRequest {
  permissionId: string
}

export interface AssignPermissionsToRoleRequest {
  permissionIds: string[]
}

export interface AssignRoleToUserRequest {
  userId: string
  organizationId: string
  roleId: string
}

export interface RemoveRoleFromUserRequest {
  userId: string
  organizationId: string
  roleId: string
}

export interface ReplaceUserRolesRequest {
  userId: string
  organizationId: string
  roleIds: string[]
}

export const rbacService = {
  // ===== PERMISSION MANAGEMENT =====

  listPermissions: async (
    organizationId: string,
    page = 1,
    limit = 50,
    search?: string
  ): Promise<PaginatedResponse<Permission>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      organizationId,
    })
    if (search) {
      params.append('search', search)
    }
    const response = await apiClient.get<PaginatedResponse<Permission>>(
      `/rbac/permissions?${params.toString()}`
    )
    return response.data
  },

  getPermission: async (permissionId: string): Promise<Permission> => {
    const response = await apiClient.get<Permission>(`/rbac/permissions/${permissionId}`)
    return response.data
  },

  createPermission: async (
    organizationId: string,
    name: string,
    description?: string
  ): Promise<Permission> => {
    const response = await apiClient.post<Permission>('/rbac/permissions', {
      organizationId,
      name,
      description,
    })
    return response.data
  },

  updatePermission: async (
    permissionId: string,
    name?: string,
    description?: string
  ): Promise<Permission> => {
    const response = await apiClient.put<Permission>(`/rbac/permissions/${permissionId}`, {
      name,
      description,
    })
    return response.data
  },

  deletePermission: async (permissionId: string): Promise<void> => {
    await apiClient.delete(`/rbac/permissions/${permissionId}`)
  },

  // ===== ROLE MANAGEMENT =====

  listRoles: async (
    organizationId: string,
    page = 1,
    limit = 50,
    search?: string
  ): Promise<PaginatedResponse<Role>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      organizationId,
    })
    if (search) {
      params.append('search', search)
    }
    const response = await apiClient.get<PaginatedResponse<Role>>(
      `/rbac/roles?${params.toString()}`
    )
    return response.data
  },

  getRole: async (roleId: string): Promise<Role> => {
    const response = await apiClient.get<Role>(`/rbac/roles/${roleId}`)
    return response.data
  },

  createRole: async (organizationId: string, data: CreateRoleRequest): Promise<Role> => {
    const response = await apiClient.post<Role>('/rbac/roles', {
      organizationId,
      ...data,
    })
    return response.data
  },

  updateRole: async (roleId: string, data: UpdateRoleRequest): Promise<Role> => {
    const response = await apiClient.put<Role>(`/rbac/roles/${roleId}`, data)
    return response.data
  },

  deleteRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/rbac/roles/${roleId}`)
  },

  cloneRole: async (roleId: string, name: string): Promise<Role> => {
    const response = await apiClient.post<Role>(`/rbac/roles/${roleId}/clone`, {
      name,
    })
    return response.data
  },

  // ===== ROLE PERMISSION MANAGEMENT =====

  assignPermissionToRole: async (roleId: string, permissionId: string): Promise<Role> => {
    const response = await apiClient.post<Role>(`/rbac/roles/${roleId}/permissions`, {
      permissionId,
    })
    return response.data
  },

  assignPermissionsToRole: async (roleId: string, permissionIds: string[]): Promise<Role> => {
    const response = await apiClient.put<Role>(`/rbac/roles/${roleId}/permissions`, {
      permissionIds,
    })
    return response.data
  },

  removePermissionFromRole: async (roleId: string, permissionId: string): Promise<Role> => {
    const response = await apiClient.delete<Role>(
      `/rbac/roles/${roleId}/permissions/${permissionId}`
    )
    return response.data
  },

  // ===== USER ROLE ASSIGNMENT =====

  assignRoleToUser: async (
    userId: string,
    organizationId: string,
    roleId: string
  ): Promise<UserRole> => {
    const response = await apiClient.post<UserRole>('/rbac/users/roles/assign', {
      userId,
      organizationId,
      roleId,
    })
    return response.data
  },

  removeRoleFromUser: async (
    userId: string,
    organizationId: string,
    roleId: string
  ): Promise<void> => {
    await apiClient.delete('/rbac/users/roles/remove', {
      data: {
        userId,
        organizationId,
        roleId,
      },
    })
  },

  replaceUserRoles: async (
    userId: string,
    organizationId: string,
    roleIds: string[]
  ): Promise<UserRole[]> => {
    const response = await apiClient.put<UserRole[]>('/rbac/users/roles/replace', {
      userId,
      organizationId,
      roleIds,
    })
    return response.data
  },

  getUserRoles: async (userId: string): Promise<UserRole[]> => {
    const response = await apiClient.get<UserRole[]>(`/rbac/users/${userId}/roles`)
    return response.data
  },

  getUserPermissions: async (userId: string): Promise<Permission[]> => {
    const response = await apiClient.get<Permission[]>(`/rbac/users/${userId}/permissions`)
    return response.data
  },

  // ===== PERMISSION CHECKING UTILITIES =====

  hasPermission: async (userId: string, permission: string): Promise<boolean> => {
    try {
      const permissions = await rbacService.getUserPermissions(userId)
      return permissions.some(p => p.name === permission)
    } catch {
      return false
    }
  },

  hasAnyPermission: async (userId: string, permissions: string[]): Promise<boolean> => {
    try {
      const userPermissions = await rbacService.getUserPermissions(userId)
      const userPermissionNames = userPermissions.map(p => p.name)
      return permissions.some(p => userPermissionNames.includes(p))
    } catch {
      return false
    }
  },

  hasAllPermissions: async (userId: string, permissions: string[]): Promise<boolean> => {
    try {
      const userPermissions = await rbacService.getUserPermissions(userId)
      const userPermissionNames = userPermissions.map(p => p.name)
      return permissions.every(p => userPermissionNames.includes(p))
    } catch {
      return false
    }
  },
}
