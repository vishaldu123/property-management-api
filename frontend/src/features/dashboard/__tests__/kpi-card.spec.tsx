import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { KpiCard } from '../components/kpi-card'
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('KpiCard', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  const config = {
    key: 'totalProperties' as const,
    label: 'Total Properties',
    description: 'Properties in portfolio',
    href: '/properties',
    icon: BuildingOffice2Icon,
  }

  it('renders loading skeleton', () => {
    render(
      <MemoryRouter>
        <KpiCard config={config} isLoading />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Total Properties loading')).toBeInTheDocument()
  })

  it('renders value and navigates on click', async () => {
    render(
      <MemoryRouter>
        <KpiCard config={config} value={12} />
      </MemoryRouter>
    )

    expect(screen.getByText('12')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Total Properties: 12/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/properties')
  })

  it('renders error state with retry', async () => {
    const onRetry = vi.fn()

    render(
      <MemoryRouter>
        <KpiCard config={config} isError onRetry={onRetry} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalled()
  })
})
