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

  listMembers: async (
    organizationId: string,
    params: { page?: number; limit?: number; search?: string } = {}
  ): Promise<
    PaginatedResponse<{
      id: string
      userId: string
      organizationId: string
      role: string
      user?: { id: string; name: string; email: string }
    }>
  > => {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.search) searchParams.append('search', params.search)

    const response = await apiClient.get<
      PaginatedResponse<{
        id: string
        userId: string
        organizationId: string
        role: string
        user?: { id: string; name: string; email: string }
      }>
    >(`/organizations/${organizationId}/members?${searchParams.toString()}`)
    return response.data
  },
}
