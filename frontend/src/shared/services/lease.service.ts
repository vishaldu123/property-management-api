import { apiClient } from './api-client'
import { PaginatedResponse } from '@/types'

export interface Lease {
  id: string
  organizationId: string
  leaseNumber: string
  propertyId: string
  unitId: string
  tenantId: string
  startDate: string
  endDate: string
  monthlyRent: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface LeaseStatistics {
  total: number
  byStatus: Record<string, number>
}

export interface ListLeasesParams {
  page?: number
  limit?: number
  status?: string
  propertyId?: string
  unitId?: string
  tenantId?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const leaseService = {
  listLeases: async (params: ListLeasesParams = {}): Promise<PaginatedResponse<Lease>> => {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.status) searchParams.append('status', params.status)
    if (params.propertyId) searchParams.append('propertyId', params.propertyId)
    if (params.unitId) searchParams.append('unitId', params.unitId)
    if (params.tenantId) searchParams.append('tenantId', params.tenantId)
    if (params.search) searchParams.append('search', params.search)
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await apiClient.get<PaginatedResponse<Lease>>(
      `/leases?${searchParams.toString()}`
    )
    return response.data
  },

  getLeaseStatistics: async (): Promise<LeaseStatistics> => {
    const response = await apiClient.get<LeaseStatistics>('/leases/stats')
    return response.data
  },
}
