import { useQuery, type QueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { fetchDashboardData } from '../services/dashboard.service'
import { DASHBOARD_REFRESH_INTERVAL_MS } from '../types'

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const

export function dashboardQueryKey(organizationId?: string | null) {
  return organizationId ? ([...DASHBOARD_QUERY_KEY, organizationId] as const) : DASHBOARD_QUERY_KEY
}

/** Invalidate cached dashboard metrics after create/update/delete mutations. */
export function invalidateDashboard(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
}

export function useDashboard(enabled = true, organizationId?: string | null) {
  const queryKey = dashboardQueryKey(organizationId)

  const query = useQuery({
    queryKey,
    queryFn: fetchDashboardData,
    enabled: enabled && Boolean(organizationId),
    refetchInterval: DASHBOARD_REFRESH_INTERVAL_MS,
    refetchOnMount: 'always',
    staleTime: 30_000,
    retry: 1,
  })

  const refresh = useCallback(() => {
    return query.refetch()
  }, [query])

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refresh,
  }
}
