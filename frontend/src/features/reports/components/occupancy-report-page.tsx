import React, { useMemo } from 'react'
import { ChartContainer } from '@/features/dashboard/components/charts/chart-container'
import { ReportLayout, useReportPageState } from './report-layout'
import { ReportMetricsGrid } from './report-metrics'
import { ReportDonutChart } from './charts/report-donut-chart'
import { ReportLineChart } from './charts/report-line-chart'
import { useReportDataset } from '../hooks/use-reports'
import {
  buildOccupancyChart,
  buildOccupancyMetrics,
  buildOccupancyTrend,
} from '../utils/reports.utils'

export const OccupancyReportPage: React.FC = () => {
  const { filters, layoutProps } = useReportPageState()
  const { data, isLoading, isError } = useReportDataset(filters)

  const metrics = useMemo(() => (data ? buildOccupancyMetrics(data) : []), [data])
  const donutData = useMemo(() => (data ? buildOccupancyChart(data) : []), [data])
  const trendData = useMemo(() => (data ? buildOccupancyTrend(data.units) : []), [data])

  const exportRows = metrics.map(m => ({ metric: m.label, value: m.value }))
  const exportColumns = [
    { key: 'metric', header: 'Metric' },
    { key: 'value', header: 'Value' },
  ]

  return (
    <ReportLayout
      title="Occupancy Report"
      description="Unit occupancy rates, vacancy analysis, and historical trends"
      reportId="occupancy"
      isLoading={isLoading}
      isError={isError}
      partialFailures={data?.failedRequests}
      exportRows={exportRows}
      exportColumns={exportColumns}
      {...layoutProps}
    >
      <ReportMetricsGrid metrics={metrics} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer
          title="Occupancy Distribution"
          description="Occupied vs vacant units"
          isLoading={isLoading}
          isEmpty={!isLoading && donutData.every(d => d.value === 0)}
          ariaLabel="Occupancy donut chart"
        >
          <ReportDonutChart data={donutData} ariaLabel="Occupancy distribution" />
        </ChartContainer>

        <ChartContainer
          title="Historical Occupancy Trend"
          description="Occupancy percentage over the last 6 months"
          isLoading={isLoading}
          isEmpty={!isLoading && trendData.every(d => d.value === 0)}
          ariaLabel="Occupancy trend line chart"
        >
          <ReportLineChart data={trendData} ariaLabel="Occupancy trend" valueLabel="Occupancy %" />
        </ChartContainer>
      </div>
    </ReportLayout>
  )
}
