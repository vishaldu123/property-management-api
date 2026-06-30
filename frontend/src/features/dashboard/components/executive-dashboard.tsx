import React from 'react'
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Alert, AlertDescription, Button, EmptyState } from '@/shared/components'
import { useAuth, usePermissionGate } from '@/shared/hooks'
import { useDashboard } from '../hooks/use-dashboard'
import { KPI_CARDS, KpiGrid } from './kpi-card'
import { OccupancyPieChart } from './charts/occupancy-pie-chart'
import { MonthlyRevenueBarChart } from './charts/monthly-revenue-bar-chart'
import { PaymentStatusDonutChart } from './charts/payment-status-donut-chart'
import { MaintenanceStatusBarChart } from './charts/maintenance-status-bar-chart'
import { ActivityFeed } from './activity-feed'
import {
  OpenMaintenanceWidget,
  RecentPaymentsWidget,
  RecentTenantsWidget,
  UpcomingLeaseExpirations,
} from './widgets/dashboard-widgets'
import { QuickActions } from './quick-actions'
import { isDashboardEmpty } from '../utils/dashboard.utils'

export const ExecutiveDashboard: React.FC = () => {
  const { user, currentOrganization, isLoading: authLoading } = useAuth()
  const { canPerform } = usePermissionGate()
  const { data, isLoading, isFetching, isError, refresh } = useDashboard(!authLoading)

  const hasPartialFailures = (data?.failedRequests.length ?? 0) > 0

  const visibleKpiKeys = KPI_CARDS.filter(
    card => !card.permission || canPerform(card.permission)
  ).map(card => card.key)

  const showCharts = canPerform('property:view') || canPerform('unit:view')
  const showPayments = canPerform('payment:view')
  const showMaintenance = canPerform('maintenance:view')
  const showActivity =
    canPerform('tenant:view') ||
    canPerform('lease:view') ||
    canPerform('payment:view') ||
    canPerform('maintenance:view')

  if (authLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
        <KpiGrid isLoading />
      </div>
    )
  }

  const dashboardEmpty = data ? isDashboardEmpty(data) : false

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {currentOrganization
              ? `${currentOrganization.name} · Welcome back, ${user?.firstName}`
              : `Welcome back, ${user?.firstName}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refresh()}
          disabled={isFetching}
          aria-label="Refresh dashboard data"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      {isError && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              Unable to load dashboard data. Ensure the backend API is running on port 5000, then
              try again.
            </span>
            <Button variant="outline" size="sm" onClick={() => refresh()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isError && hasPartialFailures && (
        <Alert>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              Some dashboard sections could not be loaded. Core metrics are still available.
            </span>
            <Button variant="outline" size="sm" onClick={() => refresh()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <KpiGrid
        kpis={data?.kpis}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refresh()}
        visibleKeys={visibleKpiKeys}
      />

      {!isLoading && !isError && dashboardEmpty && (
        <EmptyState
          title="Your dashboard is empty"
          description="Get started by creating your first property, unit, or tenant using the quick actions below."
        />
      )}

      <QuickActions />

      {showCharts && (
        <section aria-label="Dashboard charts" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {canPerform('unit:view') && (
            <OccupancyPieChart data={data?.charts.occupancy ?? []} isLoading={isLoading} />
          )}
          {showPayments && (
            <MonthlyRevenueBarChart
              data={data?.charts.monthlyRevenue ?? []}
              isLoading={isLoading}
            />
          )}
          {showPayments && (
            <PaymentStatusDonutChart
              data={data?.charts.paymentStatus ?? []}
              isLoading={isLoading}
            />
          )}
          {showMaintenance && (
            <MaintenanceStatusBarChart
              data={data?.charts.maintenanceStatus ?? []}
              isLoading={isLoading}
            />
          )}
        </section>
      )}

      {showActivity && (
        <section
          aria-label="Activity and widgets"
          className="grid grid-cols-1 xl:grid-cols-3 gap-4"
        >
          <div className="xl:col-span-1">
            <ActivityFeed items={data?.activity ?? []} isLoading={isLoading} />
          </div>
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {canPerform('lease:view') && (
              <UpcomingLeaseExpirations
                leases={data?.widgets.upcomingLeaseExpirations ?? []}
                isLoading={isLoading}
              />
            )}
            {showPayments && (
              <RecentPaymentsWidget
                payments={data?.widgets.recentPayments ?? []}
                isLoading={isLoading}
              />
            )}
            {showMaintenance && (
              <OpenMaintenanceWidget
                requests={data?.widgets.openMaintenanceRequests ?? []}
                isLoading={isLoading}
              />
            )}
            {canPerform('tenant:view') && (
              <RecentTenantsWidget
                tenants={data?.widgets.recentTenants ?? []}
                isLoading={isLoading}
              />
            )}
          </div>
        </section>
      )}
    </div>
  )
}
