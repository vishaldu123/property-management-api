import { apiClient } from '@/shared/services/api-client'
import { tenantService } from '@/shared/services/tenant.service'
import { leaseService } from '@/shared/services/lease.service'
import { paymentService } from '@/shared/services/payment.service'
import { maintenanceService } from '@/shared/services/maintenance.service'
import type { DashboardData } from '../types'
import { buildActivityFeed, buildCharts, buildKpis, buildWidgets } from '../utils/dashboard.utils'

interface PropertyStatsApi {
  total: number
  active: number
  draft: number
  archived: number
}

interface UnitStatsApi {
  total: number
  byStatus: {
    available: number
    occupied: number
    reserved: number
    underMaintenance: number
    inactive: number
  }
}

interface TenantStatsApi {
  total: number
  byStatus: Array<{ status: string; count: number }>
}

interface LeaseStatsApi {
  total: number
  byStatus: Record<string, number>
}

interface PaymentStatsApi {
  outstandingAmount: number
  pendingCount: number
  overDueCount: number
  paidCount: number
}

interface MaintenanceStatsApi {
  byStatus: Record<string, number>
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [
    propertyStats,
    unitStats,
    tenantStats,
    leaseStats,
    paymentStats,
    maintenanceStats,
    recentTenants,
    recentLeases,
    recentPaymentsResult,
    recentMaintenance,
    revenuePaymentsResult,
    expiringLeases,
  ] = await Promise.all([
    apiClient.get<PropertyStatsApi>('/properties/stats').then(r => r.data),
    apiClient.get<UnitStatsApi>('/units/stats').then(r => r.data),
    apiClient.get<TenantStatsApi>('/tenants/stats').then(r => r.data),
    apiClient.get<LeaseStatsApi>('/leases/stats').then(r => r.data),
    apiClient.get<PaymentStatsApi>('/payments/stats/organization').then(r => r.data),
    apiClient.get<MaintenanceStatsApi>('/maintenance/stats/organization').then(r => r.data),
    tenantService.listTenants({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    leaseService.listLeases({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    paymentService.listPayments({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    maintenanceService.listMaintenance({
      page: 1,
      limit: 10,
      sortBy: 'requestedDate',
      sortOrder: 'desc',
    }),
    paymentService.listPayments({
      page: 1,
      limit: 100,
      sortBy: 'paymentDate',
      sortOrder: 'desc',
    }),
    leaseService.listLeases({
      page: 1,
      limit: 20,
      status: 'Active',
      sortBy: 'endDate',
      sortOrder: 'asc',
    }),
  ])

  const kpis = buildKpis({
    propertyStats,
    unitStats,
    tenantStats,
    leaseStats,
    paymentStats,
    maintenanceStats,
  })

  const charts = buildCharts({
    unitStats,
    paymentStats,
    maintenanceStats,
    payments: revenuePaymentsResult.data,
  })

  const activity = buildActivityFeed({
    tenants: recentTenants.data.slice(0, 5),
    leases: recentLeases.data.slice(0, 5),
    payments: recentPaymentsResult.data.slice(0, 5),
    maintenance: recentMaintenance.data.slice(0, 5),
  })

  const widgets = buildWidgets({
    leases: expiringLeases.data,
    payments: recentPaymentsResult.data,
    maintenance: recentMaintenance.data,
    tenants: recentTenants.data,
  })

  return { kpis, charts, activity, widgets }
}
