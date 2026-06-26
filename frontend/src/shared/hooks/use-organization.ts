import { useQueryClient } from '@tanstack/react-query'
import { organizationService, organizationSettingsService } from '@/shared/services'
import { Organization, OrganizationSettings, OrganizationBranding, OrganizationPreferences } from '@/types'
import { useMutationWithToast, useQueryWithToast } from './use-query-with-toast'

const ORGANIZATION_QUERY_KEY = 'organizations'

export const useOrganizations = (page = 1, limit = 10) => {
  return useQueryWithToast({
    queryKey: [ORGANIZATION_QUERY_KEY, page, limit],
    queryFn: () => organizationService.list(page, limit),
  })
}

export const useOrganization = (organizationId: string | undefined, enabled = true) => {
  return useQueryWithToast({
    queryKey: [ORGANIZATION_QUERY_KEY, organizationId],
    queryFn: () => organizationService.get(organizationId!),
    enabled: !!organizationId && enabled,
  })
}

export const useOrganizationSettings = (organizationId: string | undefined, enabled = true) => {
  return useQueryWithToast({
    queryKey: [ORGANIZATION_QUERY_KEY, organizationId, 'settings'],
    queryFn: () => organizationSettingsService.getSettings(organizationId!),
    enabled: !!organizationId && enabled,
  })
}

export const useOrganizationBranding = (organizationId: string | undefined, enabled = true) => {
  return useQueryWithToast({
    queryKey: [ORGANIZATION_QUERY_KEY, organizationId, 'branding'],
    queryFn: () => organizationSettingsService.getBranding(organizationId!),
    enabled: !!organizationId && enabled,
  })
}

export const useOrganizationPreferences = (organizationId: string | undefined, enabled = true) => {
  return useQueryWithToast({
    queryKey: [ORGANIZATION_QUERY_KEY, organizationId, 'preferences'],
    queryFn: () => organizationSettingsService.getPreferences(organizationId!),
    enabled: !!organizationId && enabled,
  })
}

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ organizationId, data }: { organizationId: string; data: Partial<Organization> }) =>
        organizationService.update(organizationId, data),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [ORGANIZATION_QUERY_KEY] })
        queryClient.setQueryData([ORGANIZATION_QUERY_KEY, data.id], data)
      },
    },
    { successMessage: 'Organization updated successfully' }
  )
}

export const useUpdateOrganizationSettings = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ organizationId, settings }: { organizationId: string; settings: Partial<OrganizationSettings> }) =>
        organizationSettingsService.updateSettings(organizationId, settings),
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          [ORGANIZATION_QUERY_KEY, variables.organizationId, 'settings'],
          data
        )
      },
    },
    { successMessage: 'Settings updated successfully' }
  )
}

export const useUpdateOrganizationBranding = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ organizationId, branding }: { organizationId: string; branding: Partial<OrganizationBranding> }) =>
        organizationSettingsService.updateBranding(organizationId, branding),
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          [ORGANIZATION_QUERY_KEY, variables.organizationId, 'branding'],
          data
        )
      },
    },
    { successMessage: 'Branding updated successfully' }
  )
}

export const useUpdateOrganizationPreferences = () => {
  const queryClient = useQueryClient()

  return useMutationWithToast(
    {
      mutationFn: ({ organizationId, preferences }: { organizationId: string; preferences: Partial<OrganizationPreferences> }) =>
        organizationSettingsService.updatePreferences(organizationId, preferences),
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          [ORGANIZATION_QUERY_KEY, variables.organizationId, 'preferences'],
          data
        )
      },
    },
    { successMessage: 'Preferences updated successfully' }
  )
}
