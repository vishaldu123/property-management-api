import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { PaymentList } from '../components/payment-list'
import { propertyService, tenantService, unitService, leaseService } from '@/shared/services'
import { usePaymentsList } from '../hooks/use-payments'

vi.mock('@/shared/services', () => ({
  propertyService: { listProperties: vi.fn() },
  unitService: { listUnits: vi.fn() },
  tenantService: { listTenants: vi.fn() },
  leaseService: { listLeases: vi.fn() },
}))

vi.mock('../hooks/use-payments', () => ({
  usePaymentsList: vi.fn(),
  usePrefetchPayment: () => vi.fn(),
}))

vi.mock('@/shared/hooks', () => ({
  usePermissionGate: () => ({
    canPerform: vi.fn((permission: string) => permission.includes('payment')),
  }),
}))

const mockPayment = {
  id: 'pay-1',
  organizationId: 'org-1',
  paymentNumber: 'PAY-TEST',
  leaseId: 'lease-1',
  propertyId: 'prop-1',
  unitId: 'unit-1',
  tenantId: 'tenant-1',
  amount: 1200,
  currency: 'USD',
  paymentDate: '2025-01-15T00:00:00.000Z',
  dueDate: '2025-02-01T00:00:00.000Z',
  status: 'Pending' as const,
  paymentType: 'Rent' as const,
  paymentMethod: 'BankTransfer' as const,
  outstandingBalance: 1200,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

describe('PaymentList Component', () => {
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
      data: [{ id: 'tenant-1', firstName: 'Jane', lastName: 'Doe' } as never],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    })
    vi.mocked(leaseService.listLeases).mockResolvedValue({
      data: [{ id: 'lease-1', leaseNumber: 'L-001' } as never],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    })
  })

  const renderList = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PaymentList onView={vi.fn()} {...props} />
        </MemoryRouter>
      </QueryClientProvider>
    )

  it('renders empty state when no payments found', async () => {
    vi.mocked(usePaymentsList).mockReturnValue({
      data: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as never)

    renderList()

    await waitFor(() => {
      expect(screen.getByText(/No payments found/i)).toBeInTheDocument()
    })
  })

  it('renders payments list with data', async () => {
    vi.mocked(usePaymentsList).mockReturnValue({
      data: {
        data: [mockPayment],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as never)

    renderList()

    await waitFor(() => {
      expect(screen.getByText('PAY-TEST')).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'Jane Doe' })).toBeInTheDocument()
    })
  })

  it('shows mark paid action for permitted users', async () => {
    const onMarkPaid = vi.fn()
    vi.mocked(usePaymentsList).mockReturnValue({
      data: {
        data: [mockPayment],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as never)

    renderList({ onMarkPaid })

    await waitFor(() => {
      expect(screen.getByText('Mark Paid')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Mark Paid'))
    expect(onMarkPaid).toHaveBeenCalledWith(mockPayment)
  })
})
