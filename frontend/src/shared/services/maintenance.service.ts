import { apiClient } from './api-client'
import { PaginatedResponse } from '@/types'

export interface MaintenanceRequest {
  id: string
  organizationId: string
  requestNumber: string
  title: string
  description?: string
  category: string
  priority: string
  status: string
  propertyId: string
  unitId?: string
  tenantId?: string
  assignedTo?: string
  requestedDate: string
  scheduledDate?: string
  completedDate?: string
  estimatedCost?: number
  actualCost?: number
  createdAt: string
  updatedAt: string
}

export interface MaintenanceStatistics {
  totalRequests: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  totalEstimatedCost: number
  totalActualCost: number
}

export interface ListMaintenanceParams {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  propertyId?: string
  unitId?: string
  assignedTo?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const maintenanceService = {
  listMaintenance: async (
    params: ListMaintenanceParams = {}
  ): Promise<PaginatedResponse<MaintenanceRequest>> => {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.status) searchParams.append('status', params.status)
    if (params.priority) searchParams.append('priority', params.priority)
    if (params.category) searchParams.append('category', params.category)
    if (params.propertyId) searchParams.append('propertyId', params.propertyId)
    if (params.unitId) searchParams.append('unitId', params.unitId)
    if (params.assignedTo) searchParams.append('assignedTo', params.assignedTo)
    if (params.startDate) searchParams.append('startDate', params.startDate)
    if (params.endDate) searchParams.append('endDate', params.endDate)
    if (params.search) searchParams.append('search', params.search)
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await apiClient.get<PaginatedResponse<MaintenanceRequest>>(
      `/maintenance?${searchParams.toString()}`
    )
    return response.data
  },

  getOrganizationStatistics: async (): Promise<MaintenanceStatistics> => {
    const response = await apiClient.get<MaintenanceStatistics>('/maintenance/stats/organization')
    return response.data
  },
}
