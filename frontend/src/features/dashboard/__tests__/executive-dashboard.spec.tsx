import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ExecutiveDashboard } from '../components/executive-dashboard'

const mockRefresh = vi.fn()

vi.mock('@/shared/hooks', async () => {
  const actual = await vi.importActual('@/shared/hooks')
  return {
    ...actual,
    useAuth: () => ({
      user: {
        firstName: 'Alex',
        lastName: 'Admin',
        email: 'alex@example.com',
        roles: [
          {
            role: {
              permissions: [
                { name: 'property:view' },
                { name: 'unit:view' },
                { name: 'tenant:view' },
                { name: 'lease:view' },
                { name: 'payment:view' },
                { name: 'maintenance:view' },
                { name: 'property:create' },
              ],
            },
          },
        ],
      },
      currentOrganization: { id: 'org-1', name: 'Acme Properties' },
      isLoading: false,
      isAuthenticated: true,
    }),
    usePermissionGate: () => ({
      permissions: [
        'property:view',
        'unit:view',
        'tenant:view',
        'lease:view',
        'payment:view',
        'maintenance:view',
        'property:create',
      ],
      canPerform: (permission: string) =>
        [
          'property:view',
          'unit:view',
          'tenant:view',
          'lease:view',
          'payment:view',
          'maintenance:view',
          'property:create',
        ].includes(permission),
      canPerformAny: () => true,
      canPerformAll: () => true,
    }),
  }
})

vi.mock('../hooks/use-dashboard', () => ({
  useDashboard: () => ({
    data: {
      kpis: {
        totalProperties: 3,
        totalUnits: 12,
        occupiedUnits: 8,
        vacantUnits: 4,
        activeTenants: 6,
        activeLeases: 5,
        outstandingPayments: 2500,
        openMaintenanceRequests: 2,
      },
      charts: {
        occupancy: [
          { name: 'Occupied', value: 8 },
          { name: 'Vacant', value: 4 },
        ],
        monthlyRevenue: [{ month: 'Jun 26', revenue: 5000 }],
        paymentStatus: [
          { name: 'Paid', value: 10 },
          { name: 'Pending', value: 2 },
          { name: 'Overdue', value: 1 },
          { name: 'Refunded', value: 0 },
        ],
        maintenanceStatus: [{ name: 'Open', value: 2 }],
      },
      activity: [
        {
          id: 'tenant-1',
          type: 'tenant_created',
          time: new Date().toISOString(),
          user: 'Jane Doe',
          entity: 'jane@example.com',
          status: 'Active',
        },
      ],
      widgets: {
        upcomingLeaseExpirations: [],
        recentPayments: [],
        openMaintenanceRequests: [],
        recentTenants: [],
      },
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refresh: mockRefresh,
  }),
}))

vi.mock('@/shared/components/layout/dashboard-layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('ExecutiveDashboard integration', () => {
  beforeEach(() => {
    mockRefresh.mockReset()
  })

  it('renders KPI values and activity feed', () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExecutiveDashboard />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByRole('heading', { name: 'Executive Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Tenant created')).toBeInTheDocument()
    expect(screen.getByText('Occupancy')).toBeInTheDocument()
  })

  it('refreshes dashboard data manually', async () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExecutiveDashboard />
        </MemoryRouter>
      </QueryClientProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Refresh dashboard data' }))
    expect(mockRefresh).toHaveBeenCalled()
  })
})
