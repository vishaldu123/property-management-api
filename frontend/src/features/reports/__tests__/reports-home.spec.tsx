import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ReportsHomePage } from '../components/reports-home-page'

vi.mock('@/shared/hooks', () => ({
  usePermissionGate: () => ({
    canPerform: vi.fn(() => true),
  }),
}))

describe('ReportsHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders report cards for all report types', () => {
    render(
      <MemoryRouter>
        <ReportsHomePage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /Reports & Analytics/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Occupancy Report/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Revenue Report/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Payment Report/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Lease Report/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Tenant Report/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Maintenance Report/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Property Performance/i)).toBeInTheDocument()
  })
})
