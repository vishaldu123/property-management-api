import { apiClient } from '@/shared/services/api-client'
import { propertyService } from '@/shared/services/property.service'
import { unitService } from '@/shared/services/unit.service'
import { tenantService } from '@/shared/services/tenant.service'
import { leaseService } from '@/shared/services/lease.service'
import { paymentService } from '@/shared/services/payment.service'
import { maintenanceService } from '@/shared/services/maintenance.service'
import type { ReportDataset, ReportFilters } from '../types'

const LIST_LIMIT = 200

interface PropertyStatsApi {
  total: number
  active: number
  draft: number
  archived: number
}

interface UnitStatsApi {
  total: number
  byStatus: Record<string, number>
}

interface TenantStatsApi {
  total: number
  byStatus: Array<{ status: string; count: number }>
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

function listParams(filters: ReportFilters) {
  return {
    limit: LIST_LIMIT,
    propertyId: filters.propertyId,
    unitId: filters.unitId,
    tenantId: filters.tenantId,
    leaseId: filters.leaseId,
    status: filters.status,
    category: filters.category,
    search: filters.search,
    startDate: filters.startDate
      ? new Date(`${filters.startDate}T00:00:00.000Z`).toISOString()
      : undefined,
    endDate: filters.endDate
      ? new Date(`${filters.endDate}T23:59:59.999Z`).toISOString()
      : undefined,
  }
}

export async function fetchReportDataset(filters: ReportFilters = {}): Promise<ReportDataset> {
  const failures: string[] = []
  const params = listParams(filters)

  const [
    propertiesResult,
    unitsResult,
    tenantsResult,
    leasesResult,
    paymentsResult,
    maintenanceResult,
    propertyStats,
    unitStats,
    tenantStats,
    leaseStats,
    paymentStats,
    maintenanceStats,
  ] = await Promise.all([
    loadRequest(
      'properties',
      () => propertyService.listProperties({ limit: LIST_LIMIT, search: filters.search }),
      { data: [], total: 0, page: 1, limit: LIST_LIMIT, totalPages: 0 },
      failures
    ),
    loadRequest(
      'units',
      () => unitService.listUnits({ ...params, limit: LIST_LIMIT }),
      { data: [], total: 0, page: 1, limit: LIST_LIMIT, totalPages: 0 },
      failures
    ),
    loadRequest(
      'tenants',
      () => tenantService.listTenants({ ...params, limit: LIST_LIMIT }),
      { data: [], total: 0, page: 1, limit: LIST_LIMIT, totalPages: 0 },
      failures
    ),
    loadRequest(
      'leases',
      () => leaseService.listLeases({ ...params, limit: LIST_LIMIT }),
      { data: [], total: 0, page: 1, limit: LIST_LIMIT, totalPages: 0 },
      failures
    ),
    loadRequest(
      'payments',
      () => paymentService.listPayments({ ...params, limit: LIST_LIMIT }),
      { data: [], total: 0, page: 1, limit: LIST_LIMIT, totalPages: 0 },
      failures
    ),
    loadRequest(
      'maintenance',
      () => maintenanceService.listMaintenance({ ...params, limit: LIST_LIMIT }),
      { data: [], total: 0, page: 1, limit: LIST_LIMIT, totalPages: 0 },
      failures
    ),
    loadRequest(
      'property-stats',
      () => apiClient.get<PropertyStatsApi>('/properties/stats').then(r => r.data),
      { total: 0, active: 0, draft: 0, archived: 0 },
      failures
    ),
    loadRequest(
      'unit-stats',
      () => apiClient.get<UnitStatsApi>('/units/stats').then(r => r.data),
      { total: 0, byStatus: {} },
      failures
    ),
    loadRequest(
      'tenant-stats',
      () => apiClient.get<TenantStatsApi>('/tenants/stats').then(r => r.data),
      { total: 0, byStatus: [] },
      failures
    ),
    loadRequest(
      'lease-stats',
      () => leaseService.getLeaseStatistics(),
      { total: 0, byStatus: {} },
      failures
    ),
    loadRequest(
      'payment-stats',
      () => paymentService.getOrganizationStatistics(),
      {
        totalPayments: 0,
        totalAmount: 0,
        paidAmount: 0,
        outstandingAmount: 0,
        pendingCount: 0,
        overDueCount: 0,
        paidCount: 0,
      },
      failures
    ),
    loadRequest(
      'maintenance-stats',
      () => maintenanceService.getOrganizationStatistics(),
      {
        totalRequests: 0,
        byStatus: {},
        byPriority: {},
        totalEstimatedCost: 0,
        totalActualCost: 0,
      },
      failures
    ),
  ])

  let properties = propertiesResult.data
  if (filters.propertyId) {
    properties = properties.filter(p => p.id === filters.propertyId)
  }

  return {
    properties,
    units: unitsResult.data,
    tenants: tenantsResult.data,
    leases: leasesResult.data,
    payments: paymentsResult.data,
    maintenance: maintenanceResult.data,
    propertyStats: { total: propertyStats.total, active: propertyStats.active },
    unitStats: {
      total: unitStats.total,
      byStatus: unitStats.byStatus as Record<string, number>,
    },
    tenantStats,
    leaseStats,
    paymentStats,
    maintenanceStats,
    failedRequests: failures,
  }
}
