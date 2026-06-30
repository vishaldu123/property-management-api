import { apiClient } from '@/shared/services/api-client'
import { tenantService } from '@/shared/services/tenant.service'
import { leaseService } from '@/shared/services/lease.service'
import { paymentService } from '@/shared/services/payment.service'
import { maintenanceService } from '@/shared/services/maintenance.service'
import type { PaginatedResponse } from '@/types'
import type { Tenant } from '@/shared/services/tenant.service'
import type { Lease } from '@/shared/services/lease.service'
import type { Payment } from '@/shared/services/payment.service'
import type { MaintenanceRequest } from '@/shared/services/maintenance.service'
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

const EMPTY_PROPERTY_STATS: PropertyStatsApi = {
  total: 0,
  active: 0,
  draft: 0,
  archived: 0,
}

const EMPTY_UNIT_STATS: UnitStatsApi = {
  total: 0,
  byStatus: {
    available: 0,
    occupied: 0,
    reserved: 0,
    underMaintenance: 0,
    inactive: 0,
  },
}

const EMPTY_TENANT_STATS: TenantStatsApi = {
  total: 0,
  byStatus: [],
}

const EMPTY_LEASE_STATS: LeaseStatsApi = {
  total: 0,
  byStatus: {},
}

const EMPTY_PAYMENT_STATS: PaymentStatsApi = {
  outstandingAmount: 0,
  pendingCount: 0,
  overDueCount: 0,
  paidCount: 0,
}

const EMPTY_MAINTENANCE_STATS: MaintenanceStatsApi = {
  byStatus: {},
}

const EMPTY_TENANTS: PaginatedResponse<Tenant> = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

const EMPTY_LEASES: PaginatedResponse<Lease> = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

const EMPTY_PAYMENTS: PaginatedResponse<Payment> = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

const EMPTY_MAINTENANCE: PaginatedResponse<MaintenanceRequest> = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

async function loadRequest<T>(
  label: string,
  request: () => Promise<T>,
  fallback: T,
  failures: string[]
): Promise<T> {
  try {
    return await request()
  } catch {
    failures.push(label)
    return fallback
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const failures: string[] = []

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
    loadRequest(
      'property-stats',
      () => apiClient.get<PropertyStatsApi>('/properties/stats').then(r => r.data),
      EMPTY_PROPERTY_STATS,
      failures
    ),
    loadRequest(
      'unit-stats',
      () => apiClient.get<UnitStatsApi>('/units/stats').then(r => r.data),
      EMPTY_UNIT_STATS,
      failures
    ),
    loadRequest(
      'tenant-stats',
      () => apiClient.get<TenantStatsApi>('/tenants/stats').then(r => r.data),
      EMPTY_TENANT_STATS,
      failures
    ),
    loadRequest(
      'lease-stats',
      () => apiClient.get<LeaseStatsApi>('/leases/stats').then(r => r.data),
      EMPTY_LEASE_STATS,
      failures
    ),
    loadRequest(
      'payment-stats',
      () => apiClient.get<PaymentStatsApi>('/payments/stats/organization').then(r => r.data),
      EMPTY_PAYMENT_STATS,
      failures
    ),
    loadRequest(
      'maintenance-stats',
      () => apiClient.get<MaintenanceStatsApi>('/maintenance/stats/organization').then(r => r.data),
      EMPTY_MAINTENANCE_STATS,
      failures
    ),
    loadRequest(
      'recent-tenants',
      () =>
        tenantService.listTenants({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
      EMPTY_TENANTS,
      failures
    ),
    loadRequest(
      'recent-leases',
      () => leaseService.listLeases({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
      EMPTY_LEASES,
      failures
    ),
    loadRequest(
      'recent-payments',
      () =>
        paymentService.listPayments({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
      EMPTY_PAYMENTS,
      failures
    ),
    loadRequest(
      'recent-maintenance',
      () =>
        maintenanceService.listMaintenance({
          page: 1,
          limit: 10,
          sortBy: 'requestedDate',
          sortOrder: 'desc',
        }),
      EMPTY_MAINTENANCE,
      failures
    ),
    loadRequest(
      'revenue-payments',
      () =>
        paymentService.listPayments({
          page: 1,
          limit: 100,
          sortBy: 'paymentDate',
          sortOrder: 'desc',
        }),
      EMPTY_PAYMENTS,
      failures
    ),
    loadRequest(
      'expiring-leases',
      () =>
        leaseService.listLeases({
          page: 1,
          limit: 20,
          status: 'Active',
          sortBy: 'endDate',
          sortOrder: 'asc',
        }),
      EMPTY_LEASES,
      failures
    ),
  ])

  const coreStatsFailed = ['property-stats', 'unit-stats', 'tenant-stats'].every(key =>
    failures.includes(key)
  )

  if (coreStatsFailed) {
    throw new Error('Unable to load core dashboard statistics')
  }

  const tenantItems = recentTenants.data ?? []
  const leaseItems = recentLeases.data ?? []
  const paymentItems = recentPaymentsResult.data ?? []
  const maintenanceItems = recentMaintenance.data ?? []
  const revenuePayments = revenuePaymentsResult.data ?? []
  const expiringLeaseItems = expiringLeases.data ?? []

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
    payments: revenuePayments,
  })

  const activity = buildActivityFeed({
    tenants: tenantItems.slice(0, 5),
    leases: leaseItems.slice(0, 5),
    payments: paymentItems.slice(0, 5),
    maintenance: maintenanceItems.slice(0, 5),
  })

  const widgets = buildWidgets({
    leases: expiringLeaseItems,
    payments: paymentItems,
    maintenance: maintenanceItems,
    tenants: tenantItems,
  })

  return { kpis, charts, activity, widgets, failedRequests: failures }
}
