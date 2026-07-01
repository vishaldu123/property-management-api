import React, { useMemo } from 'react'
import { ChartContainer } from '@/features/dashboard/components/charts/chart-container'
import { ReportLayout, useReportPageState } from './report-layout'
import { ReportMetricsGrid } from './report-metrics'
import { ReportBarChart } from './charts/report-bar-chart'
import { ReportAreaChart } from './charts/report-area-chart'
import { useReportDataset } from '../hooks/use-reports'
import {
  buildMaintenanceCategoryChart,
  buildMaintenanceCostChart,
  buildMaintenanceMetrics,
} from '../utils/reports.utils'

export const MaintenanceReportPage: React.FC = () => {
  const { filters, layoutProps } = useReportPageState()
  const { data, isLoading, isError } = useReportDataset(filters)

  const metrics = useMemo(() => (data ? buildMaintenanceMetrics(data) : []), [data])
  const categoryChart = useMemo(
    () => (data ? buildMaintenanceCategoryChart(data.maintenance) : []),
    [data]
  )
  const costChart = useMemo(() => (data ? buildMaintenanceCostChart(data.maintenance) : []), [data])

  const exportRows = metrics.map(m => ({ metric: m.label, value: m.value }))

  return (
    <ReportLayout
      title="Maintenance Report"
      description="Open and completed requests, costs, and category breakdown"
      reportId="maintenance"
      isLoading={isLoading}
      isError={isError}
      partialFailures={data?.failedRequests}
      exportRows={exportRows}
      exportColumns={[
        { key: 'metric', header: 'Metric' },
        { key: 'value', header: 'Value' },
      ]}
      showCategory
      showStatus
      {...layoutProps}
    >
      <ReportMetricsGrid metrics={metrics} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer
          title="Requests by Category"
          description="Maintenance requests grouped by category"
          isLoading={isLoading}
          isEmpty={!isLoading && categoryChart.every(d => d.value === 0)}
          ariaLabel="Maintenance category bar chart"
        >
          <ReportBarChart data={categoryChart} ariaLabel="Maintenance by category" />
        </ChartContainer>

        <ChartContainer
          title="Vendor / Maintenance Costs"
          description="Completed maintenance costs over time"
          isLoading={isLoading}
          isEmpty={!isLoading && costChart.every(d => d.value === 0)}
          ariaLabel="Maintenance cost area chart"
        >
          <ReportAreaChart data={costChart} ariaLabel="Maintenance costs" valueLabel="Cost" />
        </ChartContainer>
      </div>
    </ReportLayout>
  )
}
