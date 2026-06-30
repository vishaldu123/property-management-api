import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PaymentDetailPage } from '../components/payment-detail-page'
import { tenantService, propertyService, unitService, leaseService } from '@/shared/services'
import { usePaymentDetail, useLeasePaymentHistory } from '../hooks/use-payments'

vi.mock('@/shared/services', () => ({
  paymentService: {
    deletePayment: vi.fn(),
    restorePayment: vi.fn(),
    markAsPaid: vi.fn(),
    refundPayment: vi.fn(),
    generateReceipt: vi.fn(),
  },
  tenantService: { getTenant: vi.fn() },
  propertyService: { getProperty: vi.fn() },
  unitService: { getUnit: vi.fn() },
  leaseService: { listLeases: vi.fn() },
  toastService: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

vi.mock('../hooks/use-payments', () => ({
  usePaymentDetail: vi.fn(),
  useLeasePaymentHistory: vi.fn(),
  useInvalidatePayments: () => ({
    invalidateDetail: vi.fn(),
    invalidateList: vi.fn(),
  }),
}))

vi.mock('@/shared/hooks', () => ({
  usePermissionGate: () => ({
    canPerform: vi.fn(() => true),
  }),
}))

const mockPayment = {
  id: 'pay-1',
  organizationId: 'org-1',
  paymentNumber: 'PAY-DETAIL',
  leaseId: 'lease-1',
  propertyId: 'prop-1',
  unitId: 'unit-1',
  tenantId: 'tenant-1',
  amount: 1500,
  currency: 'USD',
  paymentDate: '2025-01-15T00:00:00.000Z',
  dueDate: '2025-02-01T00:00:00.000Z',
  status: 'Pending' as const,
  paymentType: 'Rent' as const,
  paymentMethod: 'Cash' as const,
  outstandingBalance: 1500,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

describe('PaymentDetailPage integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePaymentDetail).mockReturnValue({
      data: mockPayment,
      isLoading: false,
      isError: false,
      error: null,
    } as never)
    vi.mocked(useLeasePaymentHistory).mockReturnValue({
      data: { data: [], total: 0, page: 1, limit: 50, totalPages: 0 },
    } as never)
    vi.mocked(tenantService.getTenant).mockResolvedValue({
      id: 'tenant-1',
      firstName: 'John',
      lastName: 'Smith',
    } as never)
    vi.mocked(propertyService.getProperty).mockResolvedValue({
      id: 'prop-1',
      name: 'Oak Residences',
    } as never)
    vi.mocked(unitService.getUnit).mockResolvedValue({
      id: 'unit-1',
      unitNumber: '2B',
    } as never)
    vi.mocked(leaseService.listLeases).mockResolvedValue({
      data: [{ id: 'lease-1', leaseNumber: 'L-100' } as never],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    })
  })

  it('renders payment details', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/payments/pay-1']}>
          <Routes>
            <Route path="/payments/:id" element={<PaymentDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('PAY-DETAIL')).toBeInTheDocument()
      expect(screen.getByText('John Smith')).toBeInTheDocument()
      expect(screen.getByText('Oak Residences')).toBeInTheDocument()
    })
  })
})
