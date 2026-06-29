import type { Payment } from '@/shared/services/payment.service'
import type { Tenant } from '@/shared/services/tenant.service'
import type { Lease } from '@/shared/services/lease.service'
import type { MaintenanceRequest } from '@/shared/services/maintenance.service'
import type {
  ActivityItem,
  ChartDataPoint,
  DashboardCharts,
  DashboardData,
  DashboardKpis,
  DashboardWidgets,
  MonthlyRevenuePoint,
} from '../types'
import { CHART_COLORS } from '../types'

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

export function countByStatus(
  byStatus: Array<{ status: string; count: number }>,
  status: string
): number {
  return byStatus.find(item => item.status === status)?.count ?? 0
}

export function buildKpis(input: {
  propertyStats: PropertyStatsApi
  unitStats: UnitStatsApi
  tenantStats: TenantStatsApi
  leaseStats: LeaseStatsApi
  paymentStats: PaymentStatsApi
  maintenanceStats: MaintenanceStatsApi
}): DashboardKpis {
  const { propertyStats, unitStats, tenantStats, leaseStats, paymentStats, maintenanceStats } =
    input

  const occupied = unitStats.byStatus.occupied ?? 0
  const vacant =
    (unitStats.byStatus.available ?? 0) +
    (unitStats.byStatus.reserved ?? 0) +
    (unitStats.byStatus.inactive ?? 0)

  return {
    totalProperties: propertyStats.total ?? 0,
    totalUnits: unitStats.total ?? 0,
    occupiedUnits: occupied,
    vacantUnits: vacant,
    activeTenants: countByStatus(tenantStats.byStatus, 'Active'),
    activeLeases: leaseStats.byStatus.Active ?? leaseStats.byStatus.ACTIVE ?? 0,
    outstandingPayments: paymentStats.outstandingAmount ?? 0,
    openMaintenanceRequests:
      (maintenanceStats.byStatus.Open ?? 0) +
      (maintenanceStats.byStatus.Assigned ?? 0) +
      (maintenanceStats.byStatus.Scheduled ?? 0) +
      (maintenanceStats.byStatus['In Progress'] ?? 0),
  }
}

export function buildOccupancyChart(unitStats: UnitStatsApi): ChartDataPoint[] {
  const occupied = unitStats.byStatus.occupied ?? 0
  const vacant = Math.max((unitStats.total ?? 0) - occupied, 0)

  return [
    { name: 'Occupied', value: occupied, fill: CHART_COLORS.occupied },
    { name: 'Vacant', value: vacant, fill: CHART_COLORS.vacant },
  ]
}

export function buildMonthlyRevenueChart(payments: Payment[]): MonthlyRevenuePoint[] {
  const monthMap = new Map<string, number>()
  const now = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthMap.set(key, 0)
  }

  payments
    .filter(payment => payment.status === 'Paid')
    .forEach(payment => {
      const date = new Date(payment.paymentDate || payment.paidAt || payment.createdAt)
      const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) ?? 0) + Number(payment.amount ?? 0))
      }
    })

  return Array.from(monthMap.entries()).map(([month, revenue]) => ({ month, revenue }))
}

export function buildPaymentStatusChart(
  paymentStats: PaymentStatsApi,
  payments: Payment[]
): ChartDataPoint[] {
  const refundedCount = payments.filter(payment => payment.status === 'Refunded').length

  return [
    { name: 'Paid', value: paymentStats.paidCount ?? 0, fill: CHART_COLORS.paid },
    { name: 'Pending', value: paymentStats.pendingCount ?? 0, fill: CHART_COLORS.pending },
    { name: 'Overdue', value: paymentStats.overDueCount ?? 0, fill: CHART_COLORS.overdue },
    { name: 'Refunded', value: refundedCount, fill: CHART_COLORS.refunded },
  ]
}

export function buildMaintenanceStatusChart(
  maintenanceStats: MaintenanceStatsApi
): ChartDataPoint[] {
  const byStatus = maintenanceStats.byStatus ?? {}

  return [
    { name: 'Open', value: byStatus.Open ?? 0, fill: CHART_COLORS.open },
    { name: 'Assigned', value: byStatus.Assigned ?? 0, fill: CHART_COLORS.assigned },
    { name: 'Scheduled', value: byStatus.Scheduled ?? 0, fill: CHART_COLORS.scheduled },
    {
      name: 'In Progress',
      value: byStatus['In Progress'] ?? 0,
      fill: CHART_COLORS.inProgress,
    },
    { name: 'Completed', value: byStatus.Completed ?? 0, fill: CHART_COLORS.completed },
  ]
}

export function buildCharts(input: {
  unitStats: UnitStatsApi
  paymentStats: PaymentStatsApi
  maintenanceStats: MaintenanceStatsApi
  payments: Payment[]
}): DashboardCharts {
  return {
    occupancy: buildOccupancyChart(input.unitStats),
    monthlyRevenue: buildMonthlyRevenueChart(input.payments),
    paymentStatus: buildPaymentStatusChart(input.paymentStats, input.payments),
    maintenanceStatus: buildMaintenanceStatusChart(input.maintenanceStats),
  }
}

export function buildActivityFeed(input: {
  tenants: Tenant[]
  leases: Lease[]
  payments: Payment[]
  maintenance: MaintenanceRequest[]
}): ActivityItem[] {
  const items: ActivityItem[] = []

  input.tenants.forEach(tenant => {
    items.push({
      id: `tenant-${tenant.id}`,
      type: 'tenant_created',
      time: tenant.createdAt,
      user: `${tenant.firstName} ${tenant.lastName}`.trim(),
      entity: tenant.email,
      status: tenant.status,
    })
  })

  input.leases.forEach(lease => {
    items.push({
      id: `lease-${lease.id}`,
      type: 'lease_signed',
      time: lease.createdAt,
      user: lease.leaseNumber,
      entity: `Lease #${lease.leaseNumber}`,
      status: lease.status,
    })
  })

  input.payments.forEach(payment => {
    items.push({
      id: `payment-${payment.id}`,
      type: 'payment_received',
      time: payment.paidAt || payment.paymentDate || payment.createdAt,
      user: payment.paymentNumber,
      entity: `Payment #${payment.paymentNumber}`,
      status: payment.status,
    })
  })

  input.maintenance.forEach(request => {
    items.push({
      id: `maintenance-${request.id}`,
      type: 'maintenance_created',
      time: request.requestedDate || request.createdAt,
      user: request.requestNumber,
      entity: request.title,
      status: request.status,
    })
  })

  return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 12)
}

export function buildWidgets(input: {
  leases: Lease[]
  payments: Payment[]
  maintenance: MaintenanceRequest[]
  tenants: Tenant[]
}): DashboardWidgets {
  const now = new Date()
  const in90Days = new Date(now)
  in90Days.setDate(in90Days.getDate() + 90)

  const upcomingLeaseExpirations = input.leases
    .filter(lease => {
      const endDate = new Date(lease.endDate)
      return lease.status === 'Active' && endDate >= now && endDate <= in90Days
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5)

  const openMaintenanceRequests = input.maintenance
    .filter(request => !['Completed', 'Cancelled'].includes(request.status))
    .slice(0, 5)

  return {
    upcomingLeaseExpirations,
    recentPayments: input.payments.slice(0, 5),
    openMaintenanceRequests,
    recentTenants: input.tenants.slice(0, 5),
  }
}

export function isDashboardEmpty(data: DashboardData): boolean {
  const { kpis } = data
  return (
    kpis.totalProperties === 0 &&
    kpis.totalUnits === 0 &&
    kpis.activeTenants === 0 &&
    kpis.activeLeases === 0 &&
    data.activity.length === 0
  )
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

export function getActivityLabel(type: ActivityItem['type']): string {
  switch (type) {
    case 'tenant_created':
      return 'Tenant created'
    case 'lease_signed':
      return 'Lease signed'
    case 'payment_received':
      return 'Payment received'
    case 'maintenance_created':
      return 'Maintenance created'
    default:
      return 'Activity'
  }
}
