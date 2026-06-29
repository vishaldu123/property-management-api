import type { Tenant } from '@/shared/services/tenant.service'
import type { Lease } from '@/shared/services/lease.service'
import type { Payment } from '@/shared/services/payment.service'
import type { MaintenanceRequest } from '@/shared/services/maintenance.service'

export interface DashboardKpis {
  totalProperties: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  activeTenants: number
  activeLeases: number
  outstandingPayments: number
  openMaintenanceRequests: number
}

export interface ChartDataPoint {
  name: string
  value: number
  fill?: string
}

export interface MonthlyRevenuePoint {
  month: string
  revenue: number
}

export interface DashboardCharts {
  occupancy: ChartDataPoint[]
  monthlyRevenue: MonthlyRevenuePoint[]
  paymentStatus: ChartDataPoint[]
  maintenanceStatus: ChartDataPoint[]
}

export type ActivityType =
  | 'tenant_created'
  | 'lease_signed'
  | 'payment_received'
  | 'maintenance_created'

export interface ActivityItem {
  id: string
  type: ActivityType
  time: string
  user: string
  entity: string
  status: string
}

export interface DashboardWidgets {
  upcomingLeaseExpirations: Lease[]
  recentPayments: Payment[]
  openMaintenanceRequests: MaintenanceRequest[]
  recentTenants: Tenant[]
}

export interface DashboardData {
  kpis: DashboardKpis
  charts: DashboardCharts
  activity: ActivityItem[]
  widgets: DashboardWidgets
}

export const DASHBOARD_REFRESH_INTERVAL_MS = 60_000

export const CHART_COLORS = {
  occupied: 'hsl(var(--chart-1))',
  vacant: 'hsl(var(--chart-2))',
  paid: 'hsl(var(--chart-1))',
  pending: 'hsl(var(--chart-3))',
  overdue: 'hsl(var(--chart-4))',
  refunded: 'hsl(var(--chart-5))',
  open: 'hsl(var(--chart-1))',
  assigned: 'hsl(var(--chart-2))',
  scheduled: 'hsl(var(--chart-3))',
  inProgress: 'hsl(var(--chart-4))',
  completed: 'hsl(var(--chart-5))',
} as const
