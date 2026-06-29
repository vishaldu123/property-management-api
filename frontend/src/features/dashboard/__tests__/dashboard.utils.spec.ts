import { describe, it, expect } from 'vitest'
import {
  buildKpis,
  buildOccupancyChart,
  buildMonthlyRevenueChart,
  buildPaymentStatusChart,
  buildMaintenanceStatusChart,
  buildActivityFeed,
  isDashboardEmpty,
  formatCurrency,
  formatRelativeTime,
  getActivityLabel,
  countByStatus,
} from '../utils/dashboard.utils'

describe('dashboard.utils', () => {
  const baseStats = {
    propertyStats: { total: 5, active: 4, draft: 1, archived: 0 },
    unitStats: {
      total: 20,
      byStatus: {
        available: 5,
        occupied: 12,
        reserved: 1,
        underMaintenance: 1,
        inactive: 1,
      },
    },
    tenantStats: {
      total: 10,
      byStatus: [{ status: 'Active', count: 8 }],
    },
    leaseStats: { total: 6, byStatus: { Active: 4, Pending: 2 } },
    paymentStats: {
      outstandingAmount: 1500,
      pendingCount: 2,
      overDueCount: 1,
      paidCount: 10,
    },
    maintenanceStats: {
      byStatus: { Open: 2, Assigned: 1, Scheduled: 0, 'In Progress': 1, Completed: 5 },
    },
  }

  it('buildKpis aggregates organization metrics', () => {
    const kpis = buildKpis(baseStats)

    expect(kpis.totalProperties).toBe(5)
    expect(kpis.totalUnits).toBe(20)
    expect(kpis.occupiedUnits).toBe(12)
    expect(kpis.vacantUnits).toBe(7)
    expect(kpis.activeTenants).toBe(8)
    expect(kpis.activeLeases).toBe(4)
    expect(kpis.outstandingPayments).toBe(1500)
    expect(kpis.openMaintenanceRequests).toBe(4)
  })

  it('countByStatus returns zero for missing status', () => {
    expect(countByStatus([{ status: 'Active', count: 3 }], 'Former')).toBe(0)
  })

  it('buildOccupancyChart returns occupied and vacant slices', () => {
    const chart = buildOccupancyChart(baseStats.unitStats)
    expect(chart).toHaveLength(2)
    expect(chart[0].value).toBe(12)
    expect(chart[1].value).toBe(8)
  })

  it('buildMonthlyRevenueChart groups paid payments by month', () => {
    const chart = buildMonthlyRevenueChart([
      {
        id: '1',
        organizationId: 'org',
        paymentNumber: 'P-1',
        leaseId: 'l1',
        propertyId: 'p1',
        unitId: 'u1',
        tenantId: 't1',
        amount: 1000,
        currency: 'USD',
        paymentDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        status: 'Paid',
        paymentType: 'Rent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])

    expect(chart).toHaveLength(6)
    expect(chart.some(point => point.revenue > 0)).toBe(true)
  })

  it('buildPaymentStatusChart includes refunded count', () => {
    const chart = buildPaymentStatusChart(baseStats.paymentStats, [
      {
        id: '1',
        organizationId: 'org',
        paymentNumber: 'P-1',
        leaseId: 'l1',
        propertyId: 'p1',
        unitId: 'u1',
        tenantId: 't1',
        amount: 100,
        currency: 'USD',
        paymentDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        status: 'Refunded',
        paymentType: 'Rent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])

    expect(chart.find(item => item.name === 'Refunded')?.value).toBe(1)
  })

  it('buildMaintenanceStatusChart maps workflow statuses', () => {
    const chart = buildMaintenanceStatusChart(baseStats.maintenanceStats)
    expect(chart.find(item => item.name === 'Open')?.value).toBe(2)
    expect(chart.find(item => item.name === 'Completed')?.value).toBe(5)
  })

  it('buildActivityFeed merges and sorts events', () => {
    const feed = buildActivityFeed({
      tenants: [
        {
          id: 't1',
          organizationId: 'org',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          status: 'Active',
          createdAt: '2026-06-01T10:00:00.000Z',
          updatedAt: '2026-06-01T10:00:00.000Z',
        },
      ],
      leases: [],
      payments: [],
      maintenance: [],
    })

    expect(feed).toHaveLength(1)
    expect(feed[0].type).toBe('tenant_created')
  })

  it('isDashboardEmpty detects empty organizations', () => {
    expect(
      isDashboardEmpty({
        kpis: {
          totalProperties: 0,
          totalUnits: 0,
          occupiedUnits: 0,
          vacantUnits: 0,
          activeTenants: 0,
          activeLeases: 0,
          outstandingPayments: 0,
          openMaintenanceRequests: 0,
        },
        charts: { occupancy: [], monthlyRevenue: [], paymentStatus: [], maintenanceStatus: [] },
        activity: [],
        widgets: {
          upcomingLeaseExpirations: [],
          recentPayments: [],
          openMaintenanceRequests: [],
          recentTenants: [],
        },
      })
    ).toBe(true)
  })

  it('formatCurrency formats USD values', () => {
    expect(formatCurrency(1500)).toContain('1,500')
  })

  it('formatRelativeTime returns human-readable labels', () => {
    const recent = new Date(Date.now() - 5 * 60_000).toISOString()
    expect(formatRelativeTime(recent)).toBe('5m ago')
  })

  it('getActivityLabel maps activity types', () => {
    expect(getActivityLabel('tenant_created')).toBe('Tenant created')
    expect(getActivityLabel('payment_received')).toBe('Payment received')
  })
})
