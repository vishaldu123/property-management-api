import { describe, it, expect, vi } from 'vitest'
import type { ReportDataset } from '../types'
import {
  buildOccupancyMetrics,
  buildOccupancyChart,
  buildRevenueMetrics,
  buildPaymentMetrics,
  buildLeaseMetrics,
  buildTenantMetrics,
  buildMaintenanceMetrics,
  buildPropertyPerformance,
  sortPropertyPerformance,
} from '../utils/reports.utils'
import { exportCsv, rowsToCsv as exportRowsToCsv } from '../utils/export.utils'

const baseDataset: ReportDataset = {
  properties: [
    {
      id: 'p1',
      name: 'Sunset',
      organizationId: 'o1',
      status: 'Active',
      createdAt: '',
      updatedAt: '',
    } as never,
  ],
  units: [
    {
      id: 'u1',
      propertyId: 'p1',
      status: 'Occupied',
      unitNumber: '101',
      createdAt: '2025-01-01',
      updatedAt: '2025-06-01',
    } as never,
    {
      id: 'u2',
      propertyId: 'p1',
      status: 'Available',
      unitNumber: '102',
      createdAt: '2025-01-01',
      updatedAt: '2025-06-01',
    } as never,
  ],
  tenants: [
    {
      id: 't1',
      status: 'Active',
      firstName: 'Jane',
      lastName: 'Doe',
      createdAt: '2025-03-01',
      updatedAt: '2025-03-01',
    } as never,
    {
      id: 't2',
      status: 'Former',
      firstName: 'John',
      lastName: 'Smith',
      createdAt: '2024-01-01',
      updatedAt: '2025-01-01',
    } as never,
  ],
  leases: [
    { id: 'l1', status: 'Active', endDate: '2025-12-31', leaseNumber: 'L-001' } as never,
    { id: 'l2', status: 'Expired', endDate: '2024-06-01', leaseNumber: 'L-002' } as never,
  ],
  payments: [
    {
      id: 'pay1',
      status: 'Paid',
      amount: 1000,
      propertyId: 'p1',
      paymentDate: '2025-06-01',
      createdAt: '2025-06-01',
      lateFee: 50,
    } as never,
    {
      id: 'pay2',
      status: 'Pending',
      amount: 500,
      propertyId: 'p1',
      paymentDate: '2025-06-15',
      createdAt: '2025-06-15',
    } as never,
    {
      id: 'pay3',
      status: 'Refunded',
      amount: 100,
      propertyId: 'p1',
      paymentDate: '2025-05-01',
      createdAt: '2025-05-01',
    } as never,
  ],
  maintenance: [
    {
      id: 'm1',
      status: 'Open',
      category: 'HVAC',
      propertyId: 'p1',
      requestedDate: '2025-06-01',
      actualCost: 200,
    } as never,
    {
      id: 'm2',
      status: 'Completed',
      category: 'Plumbing',
      propertyId: 'p1',
      requestedDate: '2025-05-01',
      completedDate: '2025-05-05',
      actualCost: 150,
    } as never,
  ],
  propertyStats: { total: 1, active: 1 },
  unitStats: { total: 2, byStatus: { occupied: 1, available: 1 } },
  tenantStats: { total: 2, byStatus: [{ status: 'Active', count: 1 }] },
  leaseStats: { total: 2, byStatus: { Active: 1, Expired: 1 } },
  paymentStats: {
    totalPayments: 3,
    totalAmount: 1600,
    paidAmount: 1000,
    outstandingAmount: 500,
    pendingCount: 1,
    overDueCount: 0,
    paidCount: 1,
  },
  maintenanceStats: {
    totalRequests: 2,
    byStatus: { Open: 1, Completed: 1 },
    byPriority: {},
    totalEstimatedCost: 0,
    totalActualCost: 350,
  },
  failedRequests: [],
}

describe('reports.utils', () => {
  it('buildOccupancyMetrics computes occupancy and vacancy', () => {
    const metrics = buildOccupancyMetrics(baseDataset)
    expect(metrics.find(m => m.label === 'Occupied Units')?.value).toBe('1')
    expect(metrics.find(m => m.label === 'Vacant Units')?.value).toBe('1')
    expect(metrics.find(m => m.label === 'Occupancy %')?.value).toBe('50.0%')
  })

  it('buildOccupancyChart returns occupied and vacant slices', () => {
    const chart = buildOccupancyChart(baseDataset)
    expect(chart).toHaveLength(2)
    expect(chart[0].value).toBe(1)
  })

  it('buildRevenueMetrics includes outstanding and late fees', () => {
    const metrics = buildRevenueMetrics(baseDataset)
    expect(metrics.some(m => m.label === 'Rent Collected')).toBe(true)
    expect(metrics.some(m => m.label === 'Late Fees')).toBe(true)
  })

  it('buildPaymentMetrics counts payment statuses', () => {
    const metrics = buildPaymentMetrics(baseDataset)
    expect(metrics.find(m => m.label === 'Paid')?.value).toBe('1')
    expect(metrics.find(m => m.label === 'Pending')?.value).toBe('1')
    expect(metrics.find(m => m.label === 'Refunded')?.value).toBe('1')
  })

  it('buildLeaseMetrics counts active and expired leases', () => {
    const metrics = buildLeaseMetrics(baseDataset)
    expect(metrics.find(m => m.label === 'Active')?.value).toBe('1')
    expect(metrics.find(m => m.label === 'Expired')?.value).toBe('1')
  })

  it('buildTenantMetrics counts active and former tenants', () => {
    const metrics = buildTenantMetrics(baseDataset)
    expect(metrics.find(m => m.label === 'Active Tenants')?.value).toBe('1')
    expect(metrics.find(m => m.label === 'Former Tenants')?.value).toBe('1')
  })

  it('buildMaintenanceMetrics includes open and cost', () => {
    const metrics = buildMaintenanceMetrics(baseDataset)
    expect(metrics.find(m => m.label === 'Open')?.value).toBe('1')
    expect(metrics.find(m => m.label === 'Completed')?.value).toBe('1')
  })

  it('buildPropertyPerformance aggregates per property', () => {
    const rows = buildPropertyPerformance(
      baseDataset.properties,
      baseDataset.units,
      baseDataset.payments,
      baseDataset.maintenance
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].propertyName).toBe('Sunset')
    expect(rows[0].revenue).toBe(1000)
    expect(rows[0].roi).toBe('—')
  })

  it('sortPropertyPerformance returns top and bottom performers', () => {
    const rows = [
      {
        propertyId: 'a',
        propertyName: 'A',
        revenue: 100,
        occupancyRate: 50,
        maintenanceCost: 10,
        roi: '—',
      },
      {
        propertyId: 'b',
        propertyName: 'B',
        revenue: 500,
        occupancyRate: 80,
        maintenanceCost: 20,
        roi: '—',
      },
    ]
    expect(sortPropertyPerformance(rows, 'top')[0].propertyName).toBe('B')
    expect(sortPropertyPerformance(rows, 'bottom')[0].propertyName).toBe('A')
  })
})

describe('export.utils', () => {
  it('rowsToCsv escapes commas and quotes', () => {
    const csv = exportRowsToCsv(
      [{ name: 'Test, Inc', value: '100' }],
      [
        { key: 'name', header: 'Name' },
        { key: 'value', header: 'Value' },
      ]
    )
    expect(csv).toContain('"Test, Inc"')
    expect(csv.split('\n')).toHaveLength(2)
  })

  it('exportCsv triggers download link', () => {
    const click = vi.fn()
    const revoke = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: vi.fn(() => 'blob:test'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: revoke,
    })
    vi.spyOn(document, 'createElement').mockReturnValue({ click, href: '', download: '' } as never)

    exportCsv([{ a: '1' }], [{ key: 'a', header: 'A' }], 'test.csv')

    expect(click).toHaveBeenCalled()
    expect(revoke).toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
