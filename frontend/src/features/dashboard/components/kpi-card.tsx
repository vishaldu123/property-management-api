import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BuildingOffice2Icon,
  HomeModernIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/shared/components'
import { cn } from '@/utils/cn'
import type { DashboardKpis } from '../types'
import { formatCurrency } from '../utils/dashboard.utils'

export interface KpiCardConfig {
  key: keyof DashboardKpis
  label: string
  description: string
  href: string
  permission?: string
  format?: 'number' | 'currency'
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export const KPI_CARDS: KpiCardConfig[] = [
  {
    key: 'totalProperties',
    label: 'Total Properties',
    description: 'Properties in portfolio',
    href: '/properties',
    permission: 'property:view',
    icon: BuildingOffice2Icon,
  },
  {
    key: 'totalUnits',
    label: 'Total Units',
    description: 'Units across properties',
    href: '/units',
    permission: 'unit:view',
    icon: HomeModernIcon,
  },
  {
    key: 'occupiedUnits',
    label: 'Occupied Units',
    description: 'Currently occupied',
    href: '/units?status=Occupied',
    permission: 'unit:view',
    icon: CheckCircleIcon,
  },
  {
    key: 'vacantUnits',
    label: 'Vacant Units',
    description: 'Available for lease',
    href: '/units?status=Available',
    permission: 'unit:view',
    icon: XCircleIcon,
  },
  {
    key: 'activeTenants',
    label: 'Active Tenants',
    description: 'Active tenant records',
    href: '/tenants',
    permission: 'tenant:view',
    icon: UserGroupIcon,
  },
  {
    key: 'activeLeases',
    label: 'Active Leases',
    description: 'Currently active leases',
    href: '/leases',
    permission: 'lease:view',
    icon: DocumentTextIcon,
  },
  {
    key: 'outstandingPayments',
    label: 'Outstanding Payments',
    description: 'Unpaid balance',
    href: '/payments?outstanding=true',
    permission: 'payment:view',
    format: 'currency',
    icon: BanknotesIcon,
  },
  {
    key: 'openMaintenanceRequests',
    label: 'Open Maintenance',
    description: 'Open service requests',
    href: '/maintenance',
    permission: 'maintenance:view',
    icon: WrenchScrewdriverIcon,
  },
]

interface KpiCardProps {
  config: KpiCardConfig
  value?: number
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

export const KpiCard: React.FC<KpiCardProps> = ({ config, value, isLoading, isError, onRetry }) => {
  const navigate = useNavigate()
  const Icon = config.icon

  const displayValue =
    value === undefined
      ? '—'
      : config.format === 'currency'
        ? formatCurrency(value)
        : value.toLocaleString()

  const handleClick = () => {
    if (!isLoading && !isError) {
      navigate(config.href)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  if (isLoading) {
    return (
      <Card aria-label={`${config.label} loading`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card aria-label={`${config.label} error`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="mt-2 text-xs text-primary underline">
              Retry
            </button>
          )}
        </CardContent>
      </Card>
    )
  }

  const isEmpty = value === 0

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`${config.label}: ${displayValue}`}
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
        {isEmpty && <p className="text-xs text-muted-foreground mt-2">No data yet</p>}
      </CardContent>
    </Card>
  )
}

interface KpiGridProps {
  kpis?: DashboardKpis
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  visibleKeys?: Array<keyof DashboardKpis>
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  kpis,
  isLoading,
  isError,
  onRetry,
  visibleKeys,
}) => {
  const cards = visibleKeys ? KPI_CARDS.filter(card => visibleKeys.includes(card.key)) : KPI_CARDS

  return (
    <section
      aria-label="Key performance indicators"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {cards.map(config => (
        <KpiCard
          key={config.key}
          config={config}
          value={kpis?.[config.key]}
          isLoading={isLoading}
          isError={isError}
          onRetry={onRetry}
        />
      ))}
    </section>
  )
}
