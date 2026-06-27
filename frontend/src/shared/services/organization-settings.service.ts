import { apiClient } from './api-client'
import { OrganizationSettings, OrganizationBranding, OrganizationPreferences } from '@/types'

export const organizationSettingsService = {
  // ===== SETTINGS =====

  getSettings: async (organizationId: string): Promise<OrganizationSettings> => {
    const response = await apiClient.get<OrganizationSettings>(
      `/organizations/${organizationId}/settings`
    )
    return response.data
  },

  updateSettings: async (
    organizationId: string,
    settings: Partial<OrganizationSettings>
  ): Promise<OrganizationSettings> => {
    const response = await apiClient.put<OrganizationSettings>(
      `/organizations/${organizationId}/settings`,
      settings
    )
    return response.data
  },

  // ===== BRANDING =====

  getBranding: async (organizationId: string): Promise<OrganizationBranding> => {
    const response = await apiClient.get<OrganizationBranding>(
      `/organizations/${organizationId}/branding`
    )
    return response.data
  },

  updateBranding: async (
    organizationId: string,
    branding: Partial<OrganizationBranding>
  ): Promise<OrganizationBranding> => {
    const response = await apiClient.put<OrganizationBranding>(
      `/organizations/${organizationId}/branding`,
      branding
    )
    return response.data
  },

  // ===== PREFERENCES =====

  getPreferences: async (organizationId: string): Promise<OrganizationPreferences> => {
    const response = await apiClient.get<OrganizationPreferences>(
      `/organizations/${organizationId}/preferences`
    )
    return response.data
  },

  updatePreferences: async (
    organizationId: string,
    preferences: Partial<OrganizationPreferences>
  ): Promise<OrganizationPreferences> => {
    const response = await apiClient.put<OrganizationPreferences>(
      `/organizations/${organizationId}/preferences`,
      preferences
    )
    return response.data
  },
}
