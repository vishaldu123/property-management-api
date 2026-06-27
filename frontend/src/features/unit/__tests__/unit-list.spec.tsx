import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UnitList } from '../components/unit-list'
import { unitService } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  unitService: {
    listUnits: vi.fn(),
  },
}))

vi.mock('@/shared/hooks', () => ({
  usePermissionGate: () => ({
    canPerform: vi.fn((permission: string) => permission.includes('unit')),
  }),
}))

describe('UnitList Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
  })

  it('should render empty state when no units found', async () => {
    vi.mocked(unitService.listUnits).mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <UnitList />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/No units found/i)).toBeInTheDocument()
    })
  })

  it('should render units list', async () => {
    const mockUnit = {
      id: '1',
      propertyId: 'prop-1',
      organizationId: 'org-1',
      unitNumber: '101',
      name: 'Unit 101',
      floor: 1,
      block: 'A',
      unitType: 'Apartment',
      status: 'Available',
      bedrooms: 2,
      bathrooms: 1,
      area: 1000,
      areaUnit: 'sqft',
      rentAmount: 2000,
      securityDeposit: 4000,
      availabilityDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    vi.mocked(unitService.listUnits).mockResolvedValueOnce({
      data: [mockUnit],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <UnitList onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'Apartment' })).toBeInTheDocument()
    })
  })
})
