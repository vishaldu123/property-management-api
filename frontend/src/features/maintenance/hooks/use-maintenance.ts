import { useQuery, useQueryClient } from '@tanstack/react-query'
import { maintenanceService, type ListMaintenanceParams } from '@/shared/services'
import { MAINTENANCE_QUERY_KEYS } from '../constants'

export function useMaintenanceList(params: ListMaintenanceParams, enabled = true) {
  return useQuery({
    queryKey: MAINTENANCE_QUERY_KEYS.list(params as Record<string, unknown>),
    queryFn: () => maintenanceService.listMaintenance(params),
    enabled,
    staleTime: 30_000,
  })
}

export function useMaintenanceDetail(maintenanceId: string | undefined) {
  return useQuery({
    queryKey: MAINTENANCE_QUERY_KEYS.detail(maintenanceId ?? ''),
    queryFn: () => maintenanceService.getMaintenance(maintenanceId!),
    enabled: !!maintenanceId,
    staleTime: 60_000,
  })
}

export function useMaintenanceStats() {
  return useQuery({
    queryKey: MAINTENANCE_QUERY_KEYS.stats(),
    queryFn: () => maintenanceService.getOrganizationStatistics(),
    staleTime: 60_000,
  })
}

export function usePrefetchMaintenance() {
  const queryClient = useQueryClient()

  return (maintenanceId: string) => {
    queryClient.prefetchQuery({
      queryKey: MAINTENANCE_QUERY_KEYS.detail(maintenanceId),
      queryFn: () => maintenanceService.getMaintenance(maintenanceId),
      staleTime: 60_000,
    })
  }
}

export function useInvalidateMaintenance() {
  const queryClient = useQueryClient()

  return {
    invalidateList: () =>
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.detail(id) }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.all }),
  }
}
