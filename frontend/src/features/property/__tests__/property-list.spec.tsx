import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { PropertyList } from '../components/property-list'
import { propertyService } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  propertyService: {
    listProperties: vi.fn(),
  },
  toastService: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/shared/hooks', () => ({
  usePermissionGate: () => ({
    canPerform: vi.fn((permission: string) => {
      return permission.includes('property')
    }),
  }),
}))

describe('PropertyList Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
  })

  it('should render loading state', () => {
    vi.mocked(propertyService.listProperties).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    )

    render(
      <QueryClientProvider client={queryClient}>
        <PropertyList />
      </QueryClientProvider>
    )

    // Loading state should be shown
    expect(document.body.textContent).toContain('Loading')
  })

  it('should render empty state when no properties found', async () => {
    vi.mocked(propertyService.listProperties).mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <PropertyList />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/No properties found/i)).toBeInTheDocument()
    })
  })

  it('should render properties list', async () => {
    const mockProperty = {
      id: '1',
      organizationId: 'org-1',
      name: 'Test Property',
      code: 'PROP-001',
      description: 'A test property',
      propertyType: 'Apartment',
      status: 'ACTIVE',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      timezone: 'EST',
      totalUnits: 10,
      yearBuilt: 2020,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(propertyService.listProperties).mockResolvedValueOnce({
      data: [mockProperty],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <PropertyList onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument()
      expect(screen.getByText('PROP-001')).toBeInTheDocument()
    })
  })

  it('should filter properties by search', async () => {
    const mockProperty = {
      id: '1',
      organizationId: 'org-1',
      name: 'Test Property',
      code: 'PROP-001',
      description: 'A test property',
      propertyType: 'Apartment',
      status: 'ACTIVE',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      timezone: 'EST',
      totalUnits: 10,
      yearBuilt: 2020,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(propertyService.listProperties).mockResolvedValueOnce({
      data: [mockProperty],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <PropertyList />
      </QueryClientProvider>
    )

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Search properties/i) as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'Test' } })
      expect(searchInput.value).toBe('Test')
    })
  })
})
