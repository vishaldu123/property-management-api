import React, { useMemo } from 'react'
import { ChartContainer } from '@/features/dashboard/components/charts/chart-container'
import { ReportLayout, useReportPageState } from './report-layout'
import { ReportMetricsGrid } from './report-metrics'
import { ReportPieChart } from './charts/report-pie-chart'
import { useReportDataset } from '../hooks/use-reports'
import {
  buildLeaseMetrics,
  buildLeaseStatusChart,
  buildUpcomingExpirations,
} from '../utils/reports.utils'

export const LeaseReportPage: React.FC = () => {
  const { filters, layoutProps } = useReportPageState()
  const { data, isLoading, isError } = useReportDataset(filters)

  const metrics = useMemo(() => (data ? buildLeaseMetrics(data) : []), [data])
  const statusChart = useMemo(() => (data ? buildLeaseStatusChart(data.leases) : []), [data])
  const upcoming = useMemo(() => (data ? buildUpcomingExpirations(data.leases) : []), [data])

  const exportRows = [
    ...metrics.map(m => ({ type: 'metric', label: m.label, value: m.value })),
    ...upcoming.map(l => ({
      type: 'expiration',
      label: l.leaseNumber ?? l.id,
      value: l.endDate ?? '',
    })),
  ]

  return (
    <ReportLayout
      title="Lease Report"
      description="Active leases, expirations, renewals, and terminations"
      reportId="leases"
      isLoading={isLoading}
      isError={isError}
      partialFailures={data?.failedRequests}
      exportRows={exportRows}
      exportColumns={[
        { key: 'type', header: 'Type' },
        { key: 'label', header: 'Label' },
        { key: 'value', header: 'Value' },
      ]}
      showStatus
      {...layoutProps}
    >
      <ReportMetricsGrid metrics={metrics} isLoading={isLoading} />

      <ChartContainer
        title="Lease Status Distribution"
        description="Leases grouped by status"
        isLoading={isLoading}
        isEmpty={!isLoading && statusChart.every(d => d.value === 0)}
        ariaLabel="Lease status pie chart"
      >
        <ReportPieChart data={statusChart} ariaLabel="Lease status distribution" />
      </ChartContainer>

      {upcoming.length > 0 && (
        <section aria-label="Upcoming lease expirations">
          <h2 className="text-lg font-semibold mb-3">Upcoming Expirations</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium" scope="col">
                    Lease
                  </th>
                  <th className="px-4 py-2 text-left font-medium" scope="col">
                    End Date
                  </th>
                  <th className="px-4 py-2 text-left font-medium" scope="col">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(lease => (
                  <tr key={lease.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">{lease.leaseNumber ?? lease.id.slice(0, 8)}</td>
                    <td className="px-4 py-2">
                      {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-2">{lease.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </ReportLayout>
  )
}
