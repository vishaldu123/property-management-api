import { apiClient } from './api-client'
import { PaginatedResponse } from '@/types'

export type MaintenanceStatus =
  | 'Open'
  | 'Assigned'
  | 'Scheduled'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled'

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Urgent' | 'Emergency'

export type MaintenanceCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC'
  | 'Structural'
  | 'Cleaning'
  | 'Pest Control'
  | 'Other'

export interface MaintenanceRequest {
  id: string
  organizationId: string
  requestNumber: string
  title: string
  description: string
  category: MaintenanceCategory
  priority: MaintenancePriority
  status: MaintenanceStatus
  propertyId: string
  unitId?: string
  tenantId?: string
  reportedBy: string
  assignedTo?: string
  requestedDate: string
  scheduledDate?: string
  startedDate?: string
  completedDate?: string
  estimatedCost?: number
  actualCost?: number
  vendor?: string
  notes?: string
  deletedAt?: string
  createdBy?: string
  updatedBy?: string
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

export interface CreateMaintenanceRequest {
  propertyId: string
  unitId?: string
  tenantId?: string
  assignedTo?: string
  requestNumber: string
  title: string
  description: string
  category: MaintenanceCategory
  priority: MaintenancePriority
  status: MaintenanceStatus
  requestedDate: string
  scheduledDate?: string
  estimatedCost?: string
  vendor?: string
  notes?: string
}

export interface UpdateMaintenanceRequest {
  title?: string
  description?: string
  category?: MaintenanceCategory
  priority?: MaintenancePriority
  status?: MaintenanceStatus
  assignedTo?: string
  scheduledDate?: string
  startedDate?: string
  completedDate?: string
  estimatedCost?: string
  actualCost?: string
  vendor?: string
  notes?: string
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
  sortBy?:
    | 'requestNumber'
    | 'title'
    | 'priority'
    | 'status'
    | 'requestedDate'
    | 'scheduledDate'
    | 'completedDate'
    | 'estimatedCost'
    | 'actualCost'
    | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

function normalizeMaintenance(raw: MaintenanceRequest): MaintenanceRequest {
  return {
    ...raw,
    estimatedCost: raw.estimatedCost !== undefined ? Number(raw.estimatedCost) : undefined,
    actualCost: raw.actualCost !== undefined ? Number(raw.actualCost) : undefined,
  }
}

function buildSearchParams(params: ListMaintenanceParams): string {
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

  return searchParams.toString()
}

export const maintenanceService = {
  listMaintenance: async (
    params: ListMaintenanceParams = {}
  ): Promise<PaginatedResponse<MaintenanceRequest>> => {
    const response = await apiClient.get<PaginatedResponse<MaintenanceRequest>>(
      `/maintenance?${buildSearchParams(params)}`
    )
    return {
      ...response.data,
      data: response.data.data.map(normalizeMaintenance),
    }
  },

  getMaintenance: async (maintenanceId: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.get<MaintenanceRequest>(`/maintenance/${maintenanceId}`)
    return normalizeMaintenance(response.data)
  },

  createMaintenance: async (payload: CreateMaintenanceRequest): Promise<MaintenanceRequest> => {
    const response = await apiClient.post<MaintenanceRequest>('/maintenance', payload)
    return normalizeMaintenance(response.data)
  },

  updateMaintenance: async (
    maintenanceId: string,
    payload: UpdateMaintenanceRequest
  ): Promise<MaintenanceRequest> => {
    const response = await apiClient.put<MaintenanceRequest>(
      `/maintenance/${maintenanceId}`,
      payload
    )
    return normalizeMaintenance(response.data)
  },

  assignTechnician: async (
    maintenanceId: string,
    assignedTo: string
  ): Promise<MaintenanceRequest> => {
    const response = await apiClient.patch<MaintenanceRequest>(
      `/maintenance/${maintenanceId}/assign`,
      { assignedTo }
    )
    return normalizeMaintenance(response.data)
  },

  changeStatus: async (
    maintenanceId: string,
    status: MaintenanceStatus
  ): Promise<MaintenanceRequest> => {
    const response = await apiClient.patch<MaintenanceRequest>(
      `/maintenance/${maintenanceId}/change-status`,
      { status }
    )
    return normalizeMaintenance(response.data)
  },

  addNotes: async (maintenanceId: string, notes: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.patch<MaintenanceRequest>(
      `/maintenance/${maintenanceId}/notes`,
      { notes }
    )
    return normalizeMaintenance(response.data)
  },

  deleteMaintenance: async (maintenanceId: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.delete<MaintenanceRequest>(`/maintenance/${maintenanceId}`)
    return normalizeMaintenance(response.data)
  },

  restoreMaintenance: async (maintenanceId: string): Promise<MaintenanceRequest> => {
    const response = await apiClient.patch<MaintenanceRequest>(
      `/maintenance/${maintenanceId}/restore`,
      {}
    )
    return normalizeMaintenance(response.data)
  },

  getOrganizationStatistics: async (): Promise<MaintenanceStatistics> => {
    const response = await apiClient.get<MaintenanceStatistics>('/maintenance/stats/organization')
    return {
      ...response.data,
      totalEstimatedCost: Number(response.data.totalEstimatedCost),
      totalActualCost: Number(response.data.totalActualCost),
    }
  },
}
