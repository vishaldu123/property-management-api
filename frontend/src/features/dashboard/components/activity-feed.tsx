import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components'
import { Badge } from '@/shared/components/ui/badge'
import { EmptyState } from '@/shared/components/ui/empty-state'
import { Skeleton } from '@/shared/components/skeleton'
import type { ActivityItem } from '../types'
import { formatRelativeTime, getActivityLabel } from '../utils/dashboard.utils'

interface ActivityFeedProps {
  items: ActivityItem[]
  isLoading?: boolean
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, isLoading }) => {
  if (isLoading) {
    return (
      <Card aria-label="Activity feed loading">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card aria-label="Recent activity feed">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Tenant, lease, payment, and maintenance events</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="Activity will appear as you use the platform."
          />
        ) : (
          <ul className="divide-y divide-border" role="list">
            {items.map(item => (
              <li
                key={item.id}
                className="py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{getActivityLabel(item.type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.user} · {item.entity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.status}</Badge>
                  <time className="text-xs text-muted-foreground" dateTime={item.time}>
                    {formatRelativeTime(item.time)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
