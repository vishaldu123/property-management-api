import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AdministrationHomePage } from '../components/administration-home-page'

vi.mock('@/shared/hooks', () => ({
  useRbac: () => ({
    canManageMembers: vi.fn(() => true),
    canManageRbac: vi.fn(() => true),
  }),
}))

describe('AdministrationHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders administration section cards', () => {
    render(
      <MemoryRouter>
        <AdministrationHomePage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /Administration & Settings/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Organization Settings/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Profile Settings/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open Security Settings/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Open About/i)).toBeInTheDocument()
  })
})
