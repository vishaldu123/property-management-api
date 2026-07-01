import React, { useMemo } from 'react'
import { ChartContainer } from '@/features/dashboard/components/charts/chart-container'
import { ReportLayout, useReportPageState } from './report-layout'
import { ReportMetricsGrid } from './report-metrics'
import { ReportBarChart } from './charts/report-bar-chart'
import { ReportLineChart } from './charts/report-line-chart'
import { useReportDataset } from '../hooks/use-reports'
import {
  buildCollectionEfficiency,
  buildPaymentMetrics,
  buildPaymentStatusChart,
} from '../utils/reports.utils'

export const PaymentReportPage: React.FC = () => {
  const { filters, layoutProps } = useReportPageState()
  const { data, isLoading, isError } = useReportDataset(filters)

  const metrics = useMemo(() => (data ? buildPaymentMetrics(data) : []), [data])
  const statusChart = useMemo(() => (data ? buildPaymentStatusChart(data.payments) : []), [data])
  const efficiency = useMemo(() => (data ? buildCollectionEfficiency(data.payments) : []), [data])

  const exportRows = metrics.map(m => ({ metric: m.label, value: m.value }))

  return (
    <ReportLayout
      title="Payment Report"
      description="Payment status breakdown, trends, and collection efficiency"
      reportId="payments"
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
          title="Payment Status"
          description="Distribution by payment status"
          isLoading={isLoading}
          isEmpty={!isLoading && statusChart.every(d => d.value === 0)}
          ariaLabel="Payment status bar chart"
        >
          <ReportBarChart data={statusChart} ariaLabel="Payment status" valueLabel="Count" />
        </ChartContainer>

        <ChartContainer
          title="Collection Efficiency"
          description="Percentage of payments collected per month"
          isLoading={isLoading}
          isEmpty={!isLoading && efficiency.every(d => d.value === 0)}
          ariaLabel="Collection efficiency line chart"
        >
          <ReportLineChart
            data={efficiency}
            ariaLabel="Collection efficiency"
            valueLabel="Efficiency %"
          />
        </ChartContainer>
      </div>
    </ReportLayout>
  )
}
