import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { MaintenanceList } from '../components/maintenance-list'
import { propertyService, tenantService, unitService, organizationService } from '@/shared/services'
import { useMaintenanceList } from '../hooks/use-maintenance'

vi.mock('@/shared/services', () => ({
  propertyService: { listProperties: vi.fn() },
  unitService: { listUnits: vi.fn() },
  tenantService: { listTenants: vi.fn() },
  organizationService: { listMembers: vi.fn() },
}))

vi.mock('../hooks/use-maintenance', () => ({
  useMaintenanceList: vi.fn(),
  usePrefetchMaintenance: () => vi.fn(),
}))

vi.mock('@/shared/hooks', () => ({
  usePermissionGate: () => ({
    canPerform: vi.fn((permission: string) => permission.includes('maintenance')),
  }),
  useAuth: () => ({
    currentOrganization: { id: 'org-1', name: 'Test Org' },
  }),
}))

const mockRequest = {
  id: 'mr-1',
  organizationId: 'org-1',
  requestNumber: 'MR-TEST',
  title: 'Broken AC',
  description: 'AC not cooling',
  category: 'HVAC' as const,
  priority: 'Urgent' as const,
  status: 'Open' as const,
  propertyId: 'prop-1',
  unitId: 'unit-1',
  reportedBy: 'user-1',
  requestedDate: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

describe('MaintenanceList Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.clearAllMocks()
    vi.mocked(propertyService.listProperties).mockResolvedValue({
      data: [{ id: 'prop-1', name: 'Sunset Apts' } as never],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    })
    vi.mocked(unitService.listUnits).mockResolvedValue({
      data: [{ id: 'unit-1', unitNumber: '101' } as never],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    })
    vi.mocked(tenantService.listTenants).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    })
    vi.mocked(organizationService.listMembers).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    })
  })

  it('renders empty state when no requests found', async () => {
    vi.mocked(useMaintenanceList).mockReturnValue({
      data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as never)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MaintenanceList />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/No maintenance requests found/i)).toBeInTheDocument()
    })
  })

  it('renders maintenance list with data', async () => {
    vi.mocked(useMaintenanceList).mockReturnValue({
      data: { data: [mockRequest], total: 1, page: 1, limit: 10, totalPages: 1 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as never)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MaintenanceList onView={vi.fn()} />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('MR-TEST')).toBeInTheDocument()
      expect(screen.getByText('Broken AC')).toBeInTheDocument()
    })
  })

  it('shows assign action for open requests', async () => {
    const onAssign = vi.fn()
    vi.mocked(useMaintenanceList).mockReturnValue({
      data: { data: [mockRequest], total: 1, page: 1, limit: 10, totalPages: 1 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as never)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MaintenanceList onAssign={onAssign} />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => expect(screen.getByText('Assign')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Assign'))
    expect(onAssign).toHaveBeenCalledWith(mockRequest)
  })
})
