import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { devToolsService } from '../services/administration.service'
import { ADMIN_QUERY_KEY } from '../constants'
import { invalidateDashboard } from '@/features/dashboard'

export const DEV_TOOLS_QUERY_KEY = [...ADMIN_QUERY_KEY, 'dev-tools'] as const

export function useDevDataSummary(enabled = true) {
  return useQuery({
    queryKey: [...DEV_TOOLS_QUERY_KEY, 'summary'],
    queryFn: () => devToolsService.getDataSummary(),
    enabled,
    staleTime: 10_000,
    retry: false,
  })
}

export function useSeedDemoData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (force?: boolean) => devToolsService.seedDemoData(Boolean(force)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEV_TOOLS_QUERY_KEY })
      void invalidateDashboard(queryClient)
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void queryClient.invalidateQueries({ queryKey: ['units'] })
      void queryClient.invalidateQueries({ queryKey: ['tenants'] })
      void queryClient.invalidateQueries({ queryKey: ['leases'] })
      void queryClient.invalidateQueries({ queryKey: ['payments'] })
      void queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      void queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useResetDemoData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => devToolsService.resetData(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEV_TOOLS_QUERY_KEY })
      void invalidateDashboard(queryClient)
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
      void queryClient.invalidateQueries({ queryKey: ['units'] })
      void queryClient.invalidateQueries({ queryKey: ['tenants'] })
      void queryClient.invalidateQueries({ queryKey: ['leases'] })
      void queryClient.invalidateQueries({ queryKey: ['payments'] })
      void queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      void queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
