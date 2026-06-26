import React from 'react'
import { cn } from '@/utils/cn'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton Loader component for loading states
 * Displays animated placeholder while data is loading
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-muted',
      className
    )}
    {...props}
  />
)

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={cn('h-4 rounded', i === lines - 1 && 'w-3/4')} />
    ))}
  </div>
)

export const SkeletonCard: React.FC = () => (
  <div className="rounded-lg border border-border p-4 space-y-4">
    <Skeleton className="h-6 w-1/3 rounded" />
    <SkeletonText lines={2} />
    <Skeleton className="h-10 w-full rounded" />
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-12 flex-1 rounded" />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonChart: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/4 rounded" />
    <div className="flex gap-2 h-40">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${30 + Math.random() * 70}%` }} />
      ))}
    </div>
  </div>
)

export const SkeletonGrid: React.FC<{ items?: number; columns?: number }> = ({ items = 4, columns = 2 }) => (
  <div className={`grid gap-4 grid-cols-${columns}`}>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)
