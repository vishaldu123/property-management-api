import { apiClient } from './api-client'
import { PaginatedResponse } from '@/types'

export interface Property {
  id: string
  organizationId: string
  name: string
  code: string
  description?: string
  propertyType: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  latitude?: number
  longitude?: number
  timezone: string
  totalUnits?: number
  yearBuilt?: number
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreatePropertyRequest {
  name: string
  code: string
  description?: string
  propertyType: string
  status?: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  latitude?: number
  longitude?: number
  timezone?: string
  totalUnits?: number
  yearBuilt?: number
  notes?: string
}

export interface UpdatePropertyRequest {
  name?: string
  code?: string
  description?: string
  propertyType?: string
  status?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  timezone?: string
  totalUnits?: number
  yearBuilt?: number
  notes?: string
}

export interface PropertyStatistics {
  totalProperties: number
  activeProperties: number
  draftProperties: number
  inactiveProperties: number
  archivedProperties: number
}

export interface ListPropertiesParams {
  page?: number
  limit?: number
  status?: string
  propertyType?: string
  city?: string
  country?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const propertyService = {
  listProperties: async (
    params: ListPropertiesParams = {}
  ): Promise<PaginatedResponse<Property>> => {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.status) searchParams.append('status', params.status)
    if (params.propertyType) searchParams.append('propertyType', params.propertyType)
    if (params.city) searchParams.append('city', params.city)
    if (params.country) searchParams.append('country', params.country)
    if (params.search) searchParams.append('search', params.search)
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await apiClient.get<PaginatedResponse<Property>>(
      `/properties?${searchParams.toString()}`
    )
    return response.data
  },

  getProperty: async (id: string): Promise<Property> => {
    const response = await apiClient.get<Property>(`/properties/${id}`)
    return response.data
  },

  createProperty: async (data: CreatePropertyRequest): Promise<Property> => {
    const response = await apiClient.post<Property>('/properties', data)
    return response.data
  },

  updateProperty: async (id: string, data: UpdatePropertyRequest): Promise<Property> => {
    const response = await apiClient.put<Property>(`/properties/${id}`, data)
    return response.data
  },

  deleteProperty: async (id: string): Promise<Property> => {
    const response = await apiClient.delete<Property>(`/properties/${id}`)
    return response.data
  },

  restoreProperty: async (id: string): Promise<Property> => {
    const response = await apiClient.patch<Property>(`/properties/${id}/restore`, {})
    return response.data
  },

  getPropertyStatistics: async (): Promise<PropertyStatistics> => {
    const response = await apiClient.get<PropertyStatistics>('/properties/stats')
    return response.data
  },
}
