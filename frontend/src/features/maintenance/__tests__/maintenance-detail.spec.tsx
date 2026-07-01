import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MaintenanceDetailPage } from '../components/maintenance-detail-page'
import { propertyService, tenantService, unitService, organizationService } from '@/shared/services'
import { useMaintenanceDetail } from '../hooks/use-maintenance'

vi.mock('@/shared/services', () => ({
  maintenanceService: {
    deleteMaintenance: vi.fn(),
    restoreMaintenance: vi.fn(),
    assignTechnician: vi.fn(),
    changeStatus: vi.fn(),
  },
  propertyService: { getProperty: vi.fn() },
  tenantService: { getTenant: vi.fn() },
  unitService: { getUnit: vi.fn() },
  organizationService: { listMembers: vi.fn() },
  toastService: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

vi.mock('../hooks/use-maintenance', () => ({
  useMaintenanceDetail: vi.fn(),
  useInvalidateMaintenance: () => ({
    invalidateDetail: vi.fn(),
    invalidateList: vi.fn(),
  }),
}))

vi.mock('@/shared/hooks', () => ({
  usePermissionGate: () => ({ canPerform: vi.fn(() => true) }),
  useAuth: () => ({ currentOrganization: { id: 'org-1' } }),
}))

const mockRequest = {
  id: 'mr-1',
  organizationId: 'org-1',
  requestNumber: 'MR-DETAIL',
  title: 'Roof leak',
  description: 'Water in attic',
  category: 'Structural' as const,
  priority: 'High' as const,
  status: 'Open' as const,
  propertyId: 'prop-1',
  reportedBy: 'user-1',
  requestedDate: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

describe('MaintenanceDetailPage integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMaintenanceDetail).mockReturnValue({
      data: mockRequest,
      isLoading: false,
      isError: false,
      error: null,
    } as never)
    vi.mocked(propertyService.getProperty).mockResolvedValue({
      id: 'prop-1',
      name: 'Oak Residences',
    } as never)
    vi.mocked(unitService.getUnit).mockResolvedValue({ id: 'unit-1', unitNumber: '2B' } as never)
    vi.mocked(tenantService.getTenant).mockResolvedValue({
      id: 'tenant-1',
      firstName: 'Jane',
      lastName: 'Doe',
    } as never)
    vi.mocked(organizationService.listMembers).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    })
  })

  it('renders maintenance request details', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/maintenance/mr-1']}>
          <Routes>
            <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('MR-DETAIL')).toBeInTheDocument()
      expect(screen.getByText('Roof leak')).toBeInTheDocument()
      expect(screen.getByText('Oak Residences')).toBeInTheDocument()
    })
  })
})
