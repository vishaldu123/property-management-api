import type { Payment } from '@/shared/services/payment.service'
import type { Lease } from '@/shared/services/lease.service'
import type { Tenant } from '@/shared/services/tenant.service'
import type { MaintenanceRequest } from '@/shared/services/maintenance.service'
import type { Property } from '@/shared/services/property.service'
import type { Unit } from '@/shared/services/unit.service'
import type { ChartPoint, ReportDataset, ReportMetric, TimeSeriesPoint } from '../types'
import { formatCurrency } from '@/features/dashboard/utils/dashboard.utils'
import { CHART_COLORS } from '../constants'

export { formatCurrency }

const MS_PER_DAY = 86_400_000

function countUnitStatus(byStatus: Record<string, number>, keys: string[]): number {
  const seen = new Set<string>()
  return keys.reduce((sum, key) => {
    const normalized = key.toLowerCase()
    if (seen.has(normalized)) return sum
    seen.add(normalized)
    const match = Object.entries(byStatus).find(([k]) => k.toLowerCase() === normalized)
    return sum + (match?.[1] ?? 0)
  }, 0)
}

function isWithinRange(dateStr: string | undefined, start?: string, end?: string): boolean {
  if (!dateStr) return true
  const date = new Date(dateStr).getTime()
  if (start && date < new Date(`${start}T00:00:00.000Z`).getTime()) return false
  if (end && date > new Date(`${end}T23:59:59.999Z`).getTime()) return false
  return true
}

export function buildOccupancyMetrics(dataset: ReportDataset): ReportMetric[] {
  const byStatus = dataset.unitStats.byStatus ?? {}
  const occupied = countUnitStatus(byStatus, ['occupied', 'Occupied'])
  const vacant = countUnitStatus(byStatus, [
    'available',
    'Available',
    'reserved',
    'Reserved',
    'inactive',
    'Inactive',
  ])
  const total = dataset.unitStats.total || occupied + vacant
  const occupancyPct = total > 0 ? (occupied / total) * 100 : 0
  const vacancyPct = total > 0 ? (vacant / total) * 100 : 0

  return [
    { label: 'Occupancy %', value: `${occupancyPct.toFixed(1)}%` },
    { label: 'Vacancy %', value: `${vacancyPct.toFixed(1)}%` },
    { label: 'Occupied Units', value: occupied.toLocaleString() },
    { label: 'Vacant Units', value: vacant.toLocaleString() },
  ]
}

export function buildOccupancyChart(dataset: ReportDataset): ChartPoint[] {
  const byStatus = dataset.unitStats.byStatus ?? {}
  const occupied = countUnitStatus(byStatus, ['occupied', 'Occupied'])
  const vacant = Math.max((dataset.unitStats.total ?? 0) - occupied, 0)

  return [
    { name: 'Occupied', value: occupied, fill: CHART_COLORS[0] },
    { name: 'Vacant', value: vacant, fill: CHART_COLORS[1] },
  ]
}

export function buildOccupancyTrend(units: Unit[]): TimeSeriesPoint[] {
  const monthMap = new Map<string, { occupied: number; total: number }>()
  const now = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthMap.set(key, { occupied: 0, total: 0 })
  }

  units.forEach(unit => {
    const date = new Date(unit.updatedAt || unit.createdAt)
    const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    if (!monthMap.has(key)) return
    const entry = monthMap.get(key)!
    entry.total += 1
    if (unit.status === 'Occupied' || unit.status === 'occupied') {
      entry.occupied += 1
    }
  })

  return Array.from(monthMap.entries()).map(([label, data]) => ({
    label,
    value: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
  }))
}

export function buildRevenueMetrics(dataset: ReportDataset): ReportMetric[] {
  const { paymentStats, payments } = dataset
  const paidPayments = payments.filter(p => p.status === 'Paid')
  const monthlyRevenue = paidPayments
    .filter(p => {
      const d = new Date(p.paymentDate || p.paidAt || p.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)

  const annualRevenue = paidPayments
    .filter(p => {
      const d = new Date(p.paymentDate || p.paidAt || p.createdAt)
      return d.getFullYear() === new Date().getFullYear()
    })
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)

  const lateFees = payments.reduce((sum, p) => sum + Number(p.lateFee ?? 0), 0)
  const refunds = payments
    .filter(p => p.status === 'Refunded')
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)

  return [
    { label: 'Monthly Revenue', value: formatCurrency(monthlyRevenue) },
    { label: 'Annual Revenue', value: formatCurrency(annualRevenue) },
    { label: 'Rent Collected', value: formatCurrency(paymentStats.paidAmount ?? 0) },
    { label: 'Outstanding Amount', value: formatCurrency(paymentStats.outstandingAmount ?? 0) },
    { label: 'Late Fees', value: formatCurrency(lateFees) },
    { label: 'Refunds', value: formatCurrency(refunds) },
  ]
}

export function buildRevenueChart(payments: Payment[]): TimeSeriesPoint[] {
  const monthMap = new Map<string, number>()
  const now = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthMap.set(key, 0)
  }

  payments
    .filter(p => p.status === 'Paid')
    .forEach(p => {
      const date = new Date(p.paymentDate || p.paidAt || p.createdAt)
      const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) ?? 0) + Number(p.amount ?? 0))
      }
    })

  return Array.from(monthMap.entries()).map(([label, value]) => ({ label, value }))
}

export function buildPaymentMetrics(dataset: ReportDataset): ReportMetric[] {
  const { payments } = dataset
  const countBy = (status: string) => payments.filter(p => p.status === status).length

  return [
    { label: 'Paid', value: countBy('Paid').toLocaleString() },
    { label: 'Pending', value: countBy('Pending').toLocaleString() },
    { label: 'Partial', value: countBy('PartiallyPaid').toLocaleString() },
    { label: 'Overdue', value: countBy('Overdue').toLocaleString() },
    { label: 'Refunded', value: countBy('Refunded').toLocaleString() },
    { label: 'Cancelled', value: countBy('Cancelled').toLocaleString() },
  ]
}

export function buildPaymentStatusChart(payments: Payment[]): ChartPoint[] {
  const statuses = ['Paid', 'Pending', 'PartiallyPaid', 'Overdue', 'Refunded', 'Cancelled'] as const

  return statuses.map((status, index) => ({
    name: status === 'PartiallyPaid' ? 'Partial' : status,
    value: payments.filter(p => p.status === status).length,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))
}

export function buildCollectionEfficiency(payments: Payment[]): TimeSeriesPoint[] {
  const monthMap = new Map<string, { paid: number; total: number }>()
  const now = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthMap.set(key, { paid: 0, total: 0 })
  }

  payments.forEach(p => {
    const date = new Date(p.paymentDate || p.dueDate || p.createdAt)
    const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    if (!monthMap.has(key)) return
    const entry = monthMap.get(key)!
    entry.total += 1
    if (p.status === 'Paid') entry.paid += 1
  })

  return Array.from(monthMap.entries()).map(([label, data]) => ({
    label,
    value: data.total > 0 ? Math.round((data.paid / data.total) * 100) : 0,
  }))
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / MS_PER_DAY)
}

export function buildLeaseMetrics(dataset: ReportDataset): ReportMetric[] {
  const { leases } = dataset
  const active = leases.filter(l => l.status === 'Active' || l.status === 'ACTIVE').length
  const expiringSoon = leases.filter(
    l =>
      (l.status === 'Active' || l.status === 'ACTIVE') &&
      l.endDate &&
      daysUntil(l.endDate) >= 0 &&
      daysUntil(l.endDate) <= 60
  ).length
  const expired = leases.filter(l => l.status === 'Expired' || l.status === 'EXPIRED').length
  const renewed = leases.filter(l => l.status === 'Renewed' || l.status === 'RENEWED').length
  const terminated = leases.filter(
    l => l.status === 'Terminated' || l.status === 'TERMINATED'
  ).length

  return [
    { label: 'Active', value: active.toLocaleString() },
    { label: 'Expiring Soon', value: expiringSoon.toLocaleString(), description: 'Within 60 days' },
    { label: 'Expired', value: expired.toLocaleString() },
    { label: 'Renewed', value: renewed.toLocaleString() },
    { label: 'Terminated', value: terminated.toLocaleString() },
  ]
}

export function buildUpcomingExpirations(leases: Lease[]): Lease[] {
  return leases
    .filter(
      l =>
        (l.status === 'Active' || l.status === 'ACTIVE') &&
        l.endDate &&
        daysUntil(l.endDate) >= 0 &&
        daysUntil(l.endDate) <= 90
    )
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 20)
}

export function buildLeaseStatusChart(leases: Lease[]): ChartPoint[] {
  const statusMap = new Map<string, number>()
  leases.forEach(lease => {
    const status = lease.status || 'Unknown'
    statusMap.set(status, (statusMap.get(status) ?? 0) + 1)
  })

  return Array.from(statusMap.entries()).map(([name, value], index) => ({
    name,
    value,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))
}

export function buildTenantMetrics(dataset: ReportDataset): ReportMetric[] {
  const { tenants } = dataset
  const active = tenants.filter(t => t.status === 'Active').length
  const former = tenants.filter(t => t.status === 'Inactive' || t.status === 'Former').length
  const thisYear = new Date().getFullYear()
  const moveInsThisYear = tenants.filter(t => {
    const d = new Date(t.createdAt)
    return d.getFullYear() === thisYear
  }).length
  const moveOutsThisYear = tenants.filter(t => {
    if (t.status !== 'Inactive' && t.status !== 'Former') return false
    return new Date(t.updatedAt).getFullYear() === thisYear
  }).length

  return [
    { label: 'Active Tenants', value: active.toLocaleString() },
    { label: 'Former Tenants', value: former.toLocaleString() },
    { label: 'Tenant Growth (YTD)', value: moveInsThisYear.toLocaleString() },
    { label: 'Move-ins (YTD)', value: moveInsThisYear.toLocaleString() },
    { label: 'Move-outs (YTD)', value: moveOutsThisYear.toLocaleString() },
  ]
}

export function buildTenantGrowthChart(tenants: Tenant[]): TimeSeriesPoint[] {
  const monthMap = new Map<string, number>()
  const now = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthMap.set(key, 0)
  }

  tenants.forEach(tenant => {
    const date = new Date(tenant.createdAt)
    const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
    }
  })

  return Array.from(monthMap.entries()).map(([label, value]) => ({ label, value }))
}

export function buildMoveHistory(tenants: Tenant[], type: 'in' | 'out'): Tenant[] {
  return tenants
    .filter(t => {
      if (type === 'out') {
        return t.status === 'Inactive' || t.status === 'Former'
      }
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(type === 'in' ? a.createdAt : a.updatedAt).getTime()
      const dateB = new Date(type === 'in' ? b.createdAt : b.updatedAt).getTime()
      return dateB - dateA
    })
    .slice(0, 20)
}

export function buildMaintenanceMetrics(dataset: ReportDataset): ReportMetric[] {
  const { maintenance, maintenanceStats } = dataset
  const openStatuses = ['Open', 'Assigned', 'Scheduled', 'In Progress']
  const open = maintenance.filter(m => openStatuses.includes(m.status)).length
  const completed = maintenance.filter(m => m.status === 'Completed').length

  const completedWithDates = maintenance.filter(
    m => m.status === 'Completed' && m.requestedDate && m.completedDate
  )
  const avgDays =
    completedWithDates.length > 0
      ? completedWithDates.reduce((sum, m) => {
          const start = new Date(m.requestedDate).getTime()
          const end = new Date(m.completedDate!).getTime()
          return sum + (end - start) / MS_PER_DAY
        }, 0) / completedWithDates.length
      : 0

  return [
    { label: 'Open', value: open.toLocaleString() },
    { label: 'Completed', value: completed.toLocaleString() },
    {
      label: 'Avg Completion Time',
      value: avgDays > 0 ? `${avgDays.toFixed(1)} days` : '—',
    },
    {
      label: 'Maintenance Cost',
      value: formatCurrency(maintenanceStats.totalActualCost ?? 0),
    },
  ]
}

export function buildMaintenanceCategoryChart(maintenance: MaintenanceRequest[]): ChartPoint[] {
  const categoryMap = new Map<string, number>()
  maintenance.forEach(req => {
    const category = req.category || 'Other'
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1)
  })

  return Array.from(categoryMap.entries()).map(([name, value], index) => ({
    name,
    value,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))
}

export function buildMaintenanceCostChart(maintenance: MaintenanceRequest[]): TimeSeriesPoint[] {
  const monthMap = new Map<string, number>()
  const now = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    monthMap.set(key, 0)
  }

  maintenance
    .filter(m => m.status === 'Completed')
    .forEach(m => {
      const date = new Date(m.completedDate || m.updatedAt)
      const key = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) ?? 0) + Number(m.actualCost ?? m.estimatedCost ?? 0))
      }
    })

  return Array.from(monthMap.entries()).map(([label, value]) => ({ label, value }))
}

export interface PropertyPerformanceRow {
  propertyId: string
  propertyName: string
  revenue: number
  occupancyRate: number
  maintenanceCost: number
  roi: string
}

export function buildPropertyPerformance(
  properties: Property[],
  units: Unit[],
  payments: Payment[],
  maintenance: MaintenanceRequest[]
): PropertyPerformanceRow[] {
  return properties.map(property => {
    const propertyUnits = units.filter(u => u.propertyId === property.id)
    const occupied = propertyUnits.filter(
      u => u.status === 'Occupied' || u.status === 'occupied'
    ).length
    const occupancyRate =
      propertyUnits.length > 0 ? Math.round((occupied / propertyUnits.length) * 100) : 0

    const revenue = payments
      .filter(p => p.propertyId === property.id && p.status === 'Paid')
      .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)

    const maintenanceCost = maintenance
      .filter(m => m.propertyId === property.id)
      .reduce((sum, m) => sum + Number(m.actualCost ?? m.estimatedCost ?? 0), 0)

    return {
      propertyId: property.id,
      propertyName: property.name,
      revenue,
      occupancyRate,
      maintenanceCost,
      roi: '—',
    }
  })
}

export function sortPropertyPerformance(
  rows: PropertyPerformanceRow[],
  order: 'top' | 'bottom'
): PropertyPerformanceRow[] {
  const sorted = [...rows].sort((a, b) => b.revenue - a.revenue)
  return order === 'top' ? sorted.slice(0, 5) : sorted.slice(-5).reverse()
}

export function filterDatasetByDate<T extends { createdAt: string }>(
  items: T[],
  startDate?: string,
  endDate?: string,
  dateField?: keyof T
): T[] {
  if (!startDate && !endDate) return items
  return items.filter(item => {
    const field = dateField ?? 'createdAt'
    const value = item[field] as string | undefined
    return isWithinRange(value, startDate, endDate)
  })
}
