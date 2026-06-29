import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components'
import { EmptyState } from '@/shared/components/ui/empty-state'
import { Skeleton } from '@/shared/components/skeleton'
import type { Lease } from '@/shared/services/lease.service'
import type { Payment } from '@/shared/services/payment.service'
import type { MaintenanceRequest } from '@/shared/services/maintenance.service'
import type { Tenant } from '@/shared/services/tenant.service'
import { formatCurrency, formatRelativeTime } from '../../utils/dashboard.utils'

interface WidgetListProps {
  title: string
  description: string
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage: string
  href: string
  children: React.ReactNode
}

const WidgetList: React.FC<WidgetListProps> = ({
  title,
  description,
  isLoading,
  isEmpty,
  emptyMessage,
  href,
  children,
}) => {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <button
          type="button"
          onClick={() => navigate(href)}
          className="text-xs text-primary hover:underline shrink-0"
        >
          View all
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState title={emptyMessage} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

interface UpcomingLeaseExpirationsProps {
  leases: Lease[]
  isLoading?: boolean
}

export const UpcomingLeaseExpirations: React.FC<UpcomingLeaseExpirationsProps> = ({
  leases,
  isLoading,
}) => (
  <WidgetList
    title="Upcoming Lease Expirations"
    description="Active leases expiring within 90 days"
    isLoading={isLoading}
    isEmpty={leases.length === 0}
    emptyMessage="No upcoming expirations"
    href="/leases"
  >
    <ul className="space-y-3" role="list">
      {leases.map(lease => (
        <li key={lease.id} className="flex justify-between gap-2 text-sm">
          <span className="font-medium truncate">#{lease.leaseNumber}</span>
          <span className="text-muted-foreground shrink-0">
            {new Date(lease.endDate).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  </WidgetList>
)

interface RecentPaymentsWidgetProps {
  payments: Payment[]
  isLoading?: boolean
}

export const RecentPaymentsWidget: React.FC<RecentPaymentsWidgetProps> = ({
  payments,
  isLoading,
}) => (
  <WidgetList
    title="Recent Payments"
    description="Latest payment transactions"
    isLoading={isLoading}
    isEmpty={payments.length === 0}
    emptyMessage="No payments recorded"
    href="/payments"
  >
    <ul className="space-y-3" role="list">
      {payments.map(payment => (
        <li key={payment.id} className="flex justify-between gap-2 text-sm">
          <span className="truncate">#{payment.paymentNumber}</span>
          <span className="shrink-0 font-medium">{formatCurrency(Number(payment.amount))}</span>
        </li>
      ))}
    </ul>
  </WidgetList>
)

interface OpenMaintenanceWidgetProps {
  requests: MaintenanceRequest[]
  isLoading?: boolean
}

export const OpenMaintenanceWidget: React.FC<OpenMaintenanceWidgetProps> = ({
  requests,
  isLoading,
}) => (
  <WidgetList
    title="Open Maintenance Requests"
    description="Unresolved service requests"
    isLoading={isLoading}
    isEmpty={requests.length === 0}
    emptyMessage="No open requests"
    href="/maintenance"
  >
    <ul className="space-y-3" role="list">
      {requests.map(request => (
        <li key={request.id} className="flex justify-between gap-2 text-sm">
          <span className="truncate">{request.title}</span>
          <span className="text-muted-foreground shrink-0">{request.status}</span>
        </li>
      ))}
    </ul>
  </WidgetList>
)

interface RecentTenantsWidgetProps {
  tenants: Tenant[]
  isLoading?: boolean
}

export const RecentTenantsWidget: React.FC<RecentTenantsWidgetProps> = ({ tenants, isLoading }) => (
  <WidgetList
    title="Recent Tenants"
    description="Newly added tenants"
    isLoading={isLoading}
    isEmpty={tenants.length === 0}
    emptyMessage="No tenants yet"
    href="/tenants"
  >
    <ul className="space-y-3" role="list">
      {tenants.map(tenant => (
        <li key={tenant.id} className="flex justify-between gap-2 text-sm">
          <span className="truncate">
            {tenant.firstName} {tenant.lastName}
          </span>
          <time className="text-muted-foreground shrink-0" dateTime={tenant.createdAt}>
            {formatRelativeTime(tenant.createdAt)}
          </time>
        </li>
      ))}
    </ul>
  </WidgetList>
)
