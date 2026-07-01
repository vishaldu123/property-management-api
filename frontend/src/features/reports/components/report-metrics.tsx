import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components'
import type { ReportMetric } from '../types'

interface ReportMetricsGridProps {
  metrics: ReportMetric[]
  isLoading?: boolean
}

export const ReportMetricsGrid: React.FC<ReportMetricsGridProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        aria-label="Report metrics loading"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div
      className="metric-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      role="region"
      aria-label="Report metrics"
    >
      {metrics.map(metric => (
        <Card key={metric.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="metric-value text-2xl font-bold"
              aria-label={`${metric.label}: ${metric.value}`}
            >
              {metric.value}
            </div>
            {metric.description && (
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
