import { apiClient } from '@/shared/services/api-client'
import { PaginatedResponse } from '@/types'
import type { ListMembersParams, OrganizationMember, OrganizationInvitation } from '../types'

export const membershipService = {
  listMembers: async (
    organizationId: string,
    params: ListMembersParams = {}
  ): Promise<PaginatedResponse<OrganizationMember>> => {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.search) searchParams.append('search', params.search)
    if (params.status) searchParams.append('status', params.status)
    if (params.role) searchParams.append('role', params.role)
    if (params.sort) searchParams.append('sort', params.sort)
    if (params.order) searchParams.append('order', params.order)

    const response = await apiClient.get<PaginatedResponse<OrganizationMember>>(
      `/organizations/${organizationId}/members?${searchParams.toString()}`
    )
    return response.data
  },

  inviteMember: async (
    organizationId: string,
    payload: { email: string; role?: 'OWNER' | 'ADMIN' | 'MEMBER' }
  ): Promise<OrganizationInvitation> => {
    const response = await apiClient.post<OrganizationInvitation>(
      `/organizations/${organizationId}/invitations`,
      payload
    )
    return response.data
  },

  cancelInvitation: async (
    organizationId: string,
    invitationId: string
  ): Promise<OrganizationInvitation> => {
    const response = await apiClient.post<OrganizationInvitation>(
      `/organizations/${organizationId}/invitations/${invitationId}/cancel`,
      { invitationId }
    )
    return response.data
  },

  resendInvitation: async (
    organizationId: string,
    invitationId: string
  ): Promise<OrganizationInvitation> => {
    const response = await apiClient.post<OrganizationInvitation>(
      `/organizations/${organizationId}/invitations/${invitationId}/resend`,
      { invitationId }
    )
    return response.data
  },

  suspendMember: async (
    organizationId: string,
    memberId: string,
    reason?: string
  ): Promise<OrganizationMember> => {
    const response = await apiClient.post<OrganizationMember>(
      `/organizations/${organizationId}/members/${memberId}/suspend`,
      { memberId, reason }
    )
    return response.data
  },

  reactivateMember: async (
    organizationId: string,
    memberId: string
  ): Promise<OrganizationMember> => {
    const response = await apiClient.post<OrganizationMember>(
      `/organizations/${organizationId}/members/${memberId}/reactivate`,
      { memberId }
    )
    return response.data
  },

  removeMember: async (organizationId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/organizations/${organizationId}/members/${memberId}`, {
      data: { memberId },
    })
  },
}

export interface HealthStatus {
  status: string
  version: string
  environment?: string
  timestamp?: string
}

export const healthService = {
  getDetailedHealth: async (): Promise<HealthStatus> => {
    const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000'
    const response = await fetch(`${apiUrl}/health/detailed`)
    if (!response.ok) {
      throw new Error('Unable to fetch backend health')
    }
    const json = (await response.json()) as { data?: HealthStatus } & HealthStatus
    return json.data ?? json
  },
}
