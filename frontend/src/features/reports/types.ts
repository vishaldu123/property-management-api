import type { Property } from '@/shared/services/property.service'
import type { Unit } from '@/shared/services/unit.service'
import type { Tenant } from '@/shared/services/tenant.service'
import type { Lease } from '@/shared/services/lease.service'
import type { Payment } from '@/shared/services/payment.service'
import type { MaintenanceRequest } from '@/shared/services/maintenance.service'

export interface ReportFilters {
  propertyId?: string
  unitId?: string
  tenantId?: string
  leaseId?: string
  status?: string
  category?: string
  search?: string
  startDate?: string
  endDate?: string
}

export interface SavedReportFilter {
  id: string
  name: string
  filters: ReportFilters
  createdAt: string
}

export interface ReportDataset {
  properties: Property[]
  units: Unit[]
  tenants: Tenant[]
  leases: Lease[]
  payments: Payment[]
  maintenance: MaintenanceRequest[]
  propertyStats: { total: number; active: number }
  unitStats: { total: number; byStatus: Record<string, number> }
  tenantStats: { total: number; byStatus: Array<{ status: string; count: number }> }
  leaseStats: { total: number; byStatus: Record<string, number> }
  paymentStats: {
    totalPayments: number
    totalAmount: number
    paidAmount: number
    outstandingAmount: number
    pendingCount: number
    overDueCount: number
    paidCount: number
  }
  maintenanceStats: {
    totalRequests: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    totalEstimatedCost: number
    totalActualCost: number
  }
  failedRequests: string[]
}

export interface ChartPoint {
  name: string
  value: number
  fill?: string
}

export interface TimeSeriesPoint {
  label: string
  value: number
}

export interface ReportMetric {
  label: string
  value: string
  description?: string
}
