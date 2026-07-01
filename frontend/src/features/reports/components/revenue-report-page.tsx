import React, { useMemo } from 'react'
import { ChartContainer } from '@/features/dashboard/components/charts/chart-container'
import { ReportLayout, useReportPageState } from './report-layout'
import { ReportMetricsGrid } from './report-metrics'
import { ReportBarChart } from './charts/report-bar-chart'
import { ReportAreaChart } from './charts/report-area-chart'
import { useReportDataset } from '../hooks/use-reports'
import { buildRevenueChart, buildRevenueMetrics } from '../utils/reports.utils'

export const RevenueReportPage: React.FC = () => {
  const { filters, layoutProps } = useReportPageState()
  const { data, isLoading, isError } = useReportDataset(filters)

  const metrics = useMemo(() => (data ? buildRevenueMetrics(data) : []), [data])
  const revenueChart = useMemo(() => (data ? buildRevenueChart(data.payments) : []), [data])

  const exportRows = metrics.map(m => ({ metric: m.label, value: m.value }))

  return (
    <ReportLayout
      title="Revenue Report"
      description="Monthly and annual revenue, rent collected, outstanding balances, and fees"
      reportId="revenue"
      isLoading={isLoading}
      isError={isError}
      partialFailures={data?.failedRequests}
      exportRows={exportRows}
      exportColumns={[
        { key: 'metric', header: 'Metric' },
        { key: 'value', header: 'Value' },
      ]}
      showStatus
      {...layoutProps}
    >
      <ReportMetricsGrid metrics={metrics} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer
          title="Monthly Revenue"
          description="Paid revenue over the last 6 months"
          isLoading={isLoading}
          isEmpty={!isLoading && revenueChart.every(d => d.value === 0)}
          ariaLabel="Monthly revenue bar chart"
        >
          <ReportBarChart
            data={revenueChart.map(d => ({ name: d.label, value: d.value }))}
            ariaLabel="Monthly revenue"
            valueLabel="Revenue"
          />
        </ChartContainer>

        <ChartContainer
          title="Revenue Trend"
          description="Revenue area chart over time"
          isLoading={isLoading}
          isEmpty={!isLoading && revenueChart.every(d => d.value === 0)}
          ariaLabel="Revenue area chart"
        >
          <ReportAreaChart data={revenueChart} ariaLabel="Revenue trend" valueLabel="Revenue" />
        </ChartContainer>
      </div>
    </ReportLayout>
  )
}
