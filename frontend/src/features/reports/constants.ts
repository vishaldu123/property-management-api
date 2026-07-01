import type { ReportFilters } from './types'

export const REPORTS_QUERY_KEY = ['reports', 'dataset'] as const

export const SAVED_FILTERS_STORAGE_KEY = 'reports-saved-filters'

export const REPORT_DEFINITIONS = [
  {
    id: 'occupancy',
    title: 'Occupancy Report',
    description: 'Unit occupancy, vacancy rates, and trends',
    href: '/reports/occupancy',
    permission: 'unit:view',
  },
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Rent collected, outstanding balances, and fees',
    href: '/reports/revenue',
    permission: 'payment:view',
  },
  {
    id: 'payments',
    title: 'Payment Report',
    description: 'Payment status breakdown and collection efficiency',
    href: '/reports/payments',
    permission: 'payment:view',
  },
  {
    id: 'leases',
    title: 'Lease Report',
    description: 'Active, expiring, and terminated leases',
    href: '/reports/leases',
    permission: 'lease:view',
  },
  {
    id: 'tenants',
    title: 'Tenant Report',
    description: 'Tenant growth and move-in/out history',
    href: '/reports/tenants',
    permission: 'tenant:view',
  },
  {
    id: 'maintenance',
    title: 'Maintenance Report',
    description: 'Open requests, costs, and category breakdown',
    href: '/reports/maintenance',
    permission: 'maintenance:view',
  },
  {
    id: 'property-performance',
    title: 'Property Performance',
    description: 'Revenue, occupancy, and maintenance by property',
    href: '/reports/property-performance',
    permission: 'property:view',
  },
] as const

export const EMPTY_REPORT_FILTERS: ReportFilters = {}

export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]
