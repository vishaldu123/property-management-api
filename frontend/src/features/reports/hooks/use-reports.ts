import { useQuery } from '@tanstack/react-query'
import { fetchReportDataset } from '../services/reports.service'
import { REPORTS_QUERY_KEY } from '../constants'
import type { ReportFilters } from '../types'

export function useReportDataset(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, filters],
    queryFn: () => fetchReportDataset(filters),
    staleTime: 60_000,
  })
}
