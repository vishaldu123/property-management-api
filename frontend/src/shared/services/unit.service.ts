import { apiClient } from './api-client'
import { PaginatedResponse } from '@/types'

export interface Unit {
  id: string
  propertyId: string
  organizationId: string
  unitNumber: string
  name?: string
  floor?: number
  block?: string
  unitType: string
  status: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  areaUnit: string
  rentAmount?: number
  securityDeposit?: number
  availabilityDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreateUnitRequest {
  propertyId: string
  unitNumber: string
  name?: string
  floor?: number
  block?: string
  unitType?: string
  status?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  areaUnit?: string
  rentAmount?: number
  securityDeposit?: number
  availabilityDate?: string
  notes?: string
}

export interface UpdateUnitRequest {
  unitNumber?: string
  name?: string
  floor?: number
  block?: string
  unitType?: string
  status?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  areaUnit?: string
  rentAmount?: number
  securityDeposit?: number
  availabilityDate?: string
  notes?: string
}

export interface UnitStatistics {
  totalUnits: number
  availableUnits: number
  occupiedUnits: number
  reservedUnits: number
  underMaintenanceUnits: number
  inactiveUnits: number
}

export interface ListUnitsParams {
  page?: number
  limit?: number
  propertyId?: string
  status?: string
  unitType?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const unitService = {
  listUnits: async (params: ListUnitsParams = {}): Promise<PaginatedResponse<Unit>> => {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.propertyId) searchParams.append('propertyId', params.propertyId)
    if (params.status) searchParams.append('status', params.status)
    if (params.unitType) searchParams.append('unitType', params.unitType)
    if (params.search) searchParams.append('search', params.search)
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await apiClient.get<PaginatedResponse<Unit>>(
      `/units?${searchParams.toString()}`
    )
    return response.data
  },

  getUnit: async (id: string): Promise<Unit> => {
    const response = await apiClient.get<Unit>(`/units/${id}`)
    return response.data
  },

  createUnit: async (data: CreateUnitRequest): Promise<Unit> => {
    const response = await apiClient.post<Unit>('/units', data)
    return response.data
  },

  updateUnit: async (id: string, data: UpdateUnitRequest): Promise<Unit> => {
    const response = await apiClient.put<Unit>(`/units/${id}`, data)
    return response.data
  },

  deleteUnit: async (id: string): Promise<Unit> => {
    const response = await apiClient.delete<Unit>(`/units/${id}`)
    return response.data
  },

  restoreUnit: async (id: string): Promise<Unit> => {
    const response = await apiClient.patch<Unit>(`/units/${id}/restore`, {})
    return response.data
  },

  getUnitStatistics: async (): Promise<UnitStatistics> => {
    const response = await apiClient.get<UnitStatistics>('/units/stats')
    return response.data
  },

  getPropertyUnitStatistics: async (propertyId: string): Promise<UnitStatistics> => {
    const response = await apiClient.get<UnitStatistics>(`/properties/${propertyId}/units/stats`)
    return response.data
  },
}
