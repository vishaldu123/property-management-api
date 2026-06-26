import { apiClient } from './api-client'
import { Organization, PaginatedResponse } from '@/types'

export const organizationService = {
  list: async (page = 1, limit = 10): Promise<PaginatedResponse<Organization>> => {
    const response = await apiClient.get<PaginatedResponse<Organization>>(
      `/organizations?page=${page}&limit=${limit}`
    )
    return response.data
  },

  get: async (organizationId: string): Promise<Organization> => {
    const response = await apiClient.get<Organization>(`/organizations/${organizationId}`)
    return response.data
  },

  create: async (data: Partial<Organization>): Promise<Organization> => {
    const response = await apiClient.post<Organization>('/organizations', data)
    return response.data
  },

  update: async (organizationId: string, data: Partial<Organization>): Promise<Organization> => {
    const response = await apiClient.put<Organization>(`/organizations/${organizationId}`, data)
    return response.data
  },

  delete: async (organizationId: string): Promise<void> => {
    await apiClient.delete(`/organizations/${organizationId}`)
  },

  getCurrentOrganization: (): string => {
    return localStorage.getItem('currentOrganizationId') || ''
  },

  setCurrentOrganization: (organizationId: string): void => {
    localStorage.setItem('currentOrganizationId', organizationId)
  },
}
