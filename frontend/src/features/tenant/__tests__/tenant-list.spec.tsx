import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { TenantList } from '../components/tenant-list'
import { tenantService } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  tenantService: {
    listTenants: vi.fn(),
  },
}))

vi.mock('@/shared/hooks', () => ({
  usePermissionGate: () => ({
    canPerform: vi.fn((permission: string) => permission.includes('tenant')),
  }),
}))

describe('TenantList Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
  })

  it('should render empty state when no tenants found', async () => {
    vi.mocked(tenantService.listTenants).mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <TenantList />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/No tenants found/i)).toBeInTheDocument()
    })
  })

  it('should render tenants list', async () => {
    const mockTenant = {
      id: '1',
      organizationId: 'org-1',
      unitId: 'unit-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(tenantService.listTenants).mockResolvedValueOnce({
      data: [mockTenant],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <TenantList onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })
})
