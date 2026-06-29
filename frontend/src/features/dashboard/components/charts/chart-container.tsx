import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components'
import { SkeletonChart } from '@/shared/components/skeleton'
import { EmptyState } from '@/shared/components/ui/empty-state'

interface ChartContainerProps {
  title: string
  description?: string
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  ariaLabel: string
  summary?: string
  children: React.ReactNode
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  isLoading,
  isEmpty,
  emptyMessage = 'No data available',
  ariaLabel,
  summary,
  children,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <SkeletonChart />
      ) : isEmpty ? (
        <EmptyState title={emptyMessage} />
      ) : (
        <div role="img" aria-label={ariaLabel}>
          {summary && <p className="sr-only">{summary}</p>}
          <div className="h-64 w-full">{children}</div>
        </div>
      )}
    </CardContent>
  </Card>
)
