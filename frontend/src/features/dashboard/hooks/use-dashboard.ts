import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { fetchDashboardData } from '../services/dashboard.service'
import { DASHBOARD_REFRESH_INTERVAL_MS } from '../types'

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const

export function useDashboard(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboardData,
    enabled,
    refetchInterval: DASHBOARD_REFRESH_INTERVAL_MS,
    staleTime: 30_000,
    retry: 1,
  })

  useEffect(() => {
    if (enabled) {
      void queryClient.prefetchQuery({
        queryKey: DASHBOARD_QUERY_KEY,
        queryFn: fetchDashboardData,
        staleTime: 30_000,
      })
    }
  }, [enabled, queryClient])

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
