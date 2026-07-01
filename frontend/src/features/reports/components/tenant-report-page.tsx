import React, { useMemo } from 'react'
import { ChartContainer } from '@/features/dashboard/components/charts/chart-container'
import { ReportLayout, useReportPageState } from './report-layout'
import { ReportMetricsGrid } from './report-metrics'
import { ReportLineChart } from './charts/report-line-chart'
import { useReportDataset } from '../hooks/use-reports'
import {
  buildMoveHistory,
  buildTenantGrowthChart,
  buildTenantMetrics,
} from '../utils/reports.utils'

export const TenantReportPage: React.FC = () => {
  const { filters, layoutProps } = useReportPageState()
  const { data, isLoading, isError } = useReportDataset(filters)

  const metrics = useMemo(() => (data ? buildTenantMetrics(data) : []), [data])
  const growth = useMemo(() => (data ? buildTenantGrowthChart(data.tenants) : []), [data])
  const moveIns = useMemo(() => (data ? buildMoveHistory(data.tenants, 'in') : []), [data])
  const moveOuts = useMemo(() => (data ? buildMoveHistory(data.tenants, 'out') : []), [data])

  const exportRows = metrics.map(m => ({ metric: m.label, value: m.value }))

  return (
    <ReportLayout
      title="Tenant Report"
      description="Active and former tenants, growth trends, and move history"
      reportId="tenants"
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

      <ChartContainer
        title="Tenant Growth"
        description="New tenants per month over the last 6 months"
        isLoading={isLoading}
        isEmpty={!isLoading && growth.every(d => d.value === 0)}
        ariaLabel="Tenant growth line chart"
      >
        <ReportLineChart data={growth} ariaLabel="Tenant growth" valueLabel="New Tenants" />
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TenantHistoryTable title="Move-in History" tenants={moveIns} dateField="createdAt" />
        <TenantHistoryTable title="Move-out History" tenants={moveOuts} dateField="updatedAt" />
      </div>
    </ReportLayout>
  )
}

interface TenantHistoryTableProps {
  title: string
  tenants: Array<{
    id: string
    firstName: string
    lastName: string
    status: string
    createdAt: string
    updatedAt: string
  }>
  dateField: 'createdAt' | 'updatedAt'
}

const TenantHistoryTable: React.FC<TenantHistoryTableProps> = ({ title, tenants, dateField }) => (
  <section aria-label={title}>
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {tenants.length === 0 ? (
      <p className="text-sm text-muted-foreground">No records</p>
    ) : (
      <div className="overflow-x-auto rounded-lg border border-border max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/50">
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left font-medium" scope="col">
                Tenant
              </th>
              <th className="px-4 py-2 text-left font-medium" scope="col">
                Date
              </th>
              <th className="px-4 py-2 text-left font-medium" scope="col">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2">
                  {t.firstName} {t.lastName}
                </td>
                <td className="px-4 py-2">{new Date(t[dateField]).toLocaleDateString()}</td>
                <td className="px-4 py-2">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)
