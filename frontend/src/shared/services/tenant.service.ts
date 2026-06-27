import { apiClient } from './api-client'
import { PaginatedResponse } from '@/types'

export interface Tenant {
  id: string
  organizationId: string
  unitId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  governmentIdType?: string
  governmentIdNumber?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  occupation?: string
  employer?: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreateTenantRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  governmentIdType?: string
  governmentIdNumber?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  occupation?: string
  employer?: string
  unitId?: string
  status?: string
  notes?: string
}

export interface UpdateTenantRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  governmentIdType?: string
  governmentIdNumber?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  occupation?: string
  employer?: string
  unitId?: string
  status?: string
  notes?: string
}

export interface TenantStatistics {
  totalTenants: number
  activeTenants: number
  prospectTenants: number
  noticeTenants: number
  formerTenants: number
  blacklistedTenants: number
}

export interface ListTenantsParams {
  page?: number
  limit?: number
  unitId?: string
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const tenantService = {
  listTenants: async (params: ListTenantsParams = {}): Promise<PaginatedResponse<Tenant>> => {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.unitId) searchParams.append('unitId', params.unitId)
    if (params.status) searchParams.append('status', params.status)
    if (params.search) searchParams.append('search', params.search)
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await apiClient.get<PaginatedResponse<Tenant>>(
      `/tenants?${searchParams.toString()}`
    )
    return response.data
  },

  getTenant: async (id: string): Promise<Tenant> => {
    const response = await apiClient.get<Tenant>(`/tenants/${id}`)
    return response.data
  },

  createTenant: async (data: CreateTenantRequest): Promise<Tenant> => {
    const response = await apiClient.post<Tenant>('/tenants', data)
    return response.data
  },

  updateTenant: async (id: string, data: UpdateTenantRequest): Promise<Tenant> => {
    const response = await apiClient.put<Tenant>(`/tenants/${id}`, data)
    return response.data
  },

  deleteTenant: async (id: string): Promise<Tenant> => {
    const response = await apiClient.delete<Tenant>(`/tenants/${id}`)
    return response.data
  },

  restoreTenant: async (id: string): Promise<Tenant> => {
    const response = await apiClient.patch<Tenant>(`/tenants/${id}/restore`, {})
    return response.data
  },

  getTenantStatistics: async (): Promise<TenantStatistics> => {
    const response = await apiClient.get<TenantStatistics>('/tenants/stats')
    return response.data
  },

  getUnitTenantStatistics: async (unitId: string): Promise<TenantStatistics> => {
    const response = await apiClient.get<TenantStatistics>(`/units/${unitId}/tenants/stats`)
    return response.data
  },
}
