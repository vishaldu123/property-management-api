import React, { useMemo } from 'react'
import { ChartContainer } from '@/features/dashboard/components/charts/chart-container'
import { ReportLayout, useReportPageState } from './report-layout'
import { ReportBarChart } from './charts/report-bar-chart'
import { ReportStackedBarChart } from './charts/report-stacked-bar-chart'
import { useReportDataset } from '../hooks/use-reports'
import {
  buildPropertyPerformance,
  formatCurrency,
  sortPropertyPerformance,
} from '../utils/reports.utils'

export const PropertyPerformanceReportPage: React.FC = () => {
  const { filters, layoutProps } = useReportPageState()
  const { data, isLoading, isError } = useReportDataset(filters)

  const performance = useMemo(() => {
    if (!data) return []
    return buildPropertyPerformance(data.properties, data.units, data.payments, data.maintenance)
  }, [data])

  const topPerformers = useMemo(() => sortPropertyPerformance(performance, 'top'), [performance])
  const bottomPerformers = useMemo(
    () => sortPropertyPerformance(performance, 'bottom'),
    [performance]
  )

  const revenueChart = useMemo(
    () => topPerformers.map(p => ({ name: p.propertyName, value: p.revenue })),
    [topPerformers]
  )

  const stackedData = useMemo(
    () =>
      topPerformers.map(p => ({
        name: p.propertyName.slice(0, 12),
        revenue: p.revenue,
        maintenance: p.maintenanceCost,
      })),
    [topPerformers]
  )

  const exportRows = performance.map(p => ({
    property: p.propertyName,
    revenue: formatCurrency(p.revenue),
    occupancy: `${p.occupancyRate}%`,
    maintenanceCost: formatCurrency(p.maintenanceCost),
    roi: p.roi,
  }))

  return (
    <ReportLayout
      title="Property Performance"
      description="Revenue, occupancy, maintenance costs, and comparative performance"
      reportId="property-performance"
      isLoading={isLoading}
      isError={isError}
      partialFailures={data?.failedRequests}
      exportRows={exportRows}
      exportColumns={[
        { key: 'property', header: 'Property' },
        { key: 'revenue', header: 'Revenue' },
        { key: 'occupancy', header: 'Occupancy' },
        { key: 'maintenanceCost', header: 'Maintenance Cost' },
        { key: 'roi', header: 'ROI' },
      ]}
      {...layoutProps}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer
          title="Top Performing Properties (Revenue)"
          description="Highest revenue properties"
          isLoading={isLoading}
          isEmpty={!isLoading && revenueChart.every(d => d.value === 0)}
          ariaLabel="Top property revenue bar chart"
        >
          <ReportBarChart
            data={revenueChart}
            ariaLabel="Top property revenue"
            valueLabel="Revenue"
          />
        </ChartContainer>

        <ChartContainer
          title="Revenue vs Maintenance Cost"
          description="Stacked comparison for top properties"
          isLoading={isLoading}
          isEmpty={!isLoading && stackedData.length === 0}
          ariaLabel="Revenue vs maintenance stacked bar chart"
        >
          <ReportStackedBarChart
            data={stackedData}
            series={[
              { key: 'revenue', label: 'Revenue', fill: 'hsl(var(--chart-1))' },
              { key: 'maintenance', label: 'Maintenance', fill: 'hsl(var(--chart-3))' },
            ]}
            ariaLabel="Revenue vs maintenance"
          />
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerformanceTable title="Top Performing Properties" rows={topPerformers} />
        <PerformanceTable title="Lowest Performing Properties" rows={bottomPerformers} />
      </div>
    </ReportLayout>
  )
}

interface PerformanceTableProps {
  title: string
  rows: Array<{
    propertyName: string
    revenue: number
    occupancyRate: number
    maintenanceCost: number
    roi: string
  }>
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({ title, rows }) => (
  <section aria-label={title}>
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {rows.length === 0 ? (
      <p className="text-sm text-muted-foreground">No property data</p>
    ) : (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2 text-left font-medium" scope="col">
                Property
              </th>
              <th className="px-4 py-2 text-right font-medium" scope="col">
                Revenue
              </th>
              <th className="px-4 py-2 text-right font-medium" scope="col">
                Occupancy
              </th>
              <th className="px-4 py-2 text-right font-medium" scope="col">
                Maint. Cost
              </th>
              <th className="px-4 py-2 text-right font-medium" scope="col">
                ROI
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.propertyName} className="border-b border-border last:border-0">
                <td className="px-4 py-2">{row.propertyName}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(row.revenue)}</td>
                <td className="px-4 py-2 text-right">{row.occupancyRate}%</td>
                <td className="px-4 py-2 text-right">{formatCurrency(row.maintenanceCost)}</td>
                <td className="px-4 py-2 text-right text-muted-foreground">{row.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)
