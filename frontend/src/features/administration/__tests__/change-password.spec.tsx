import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ChangePasswordPage } from '../components/change-password-page'

vi.mock('../hooks/use-administration', () => ({
  useChangePassword: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}))

describe('ChangePasswordPage integration', () => {
  it('renders password form fields', async () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChangePasswordPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'OldPass123!' },
    })
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'NewPass123!' },
    })
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'NewPass123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }))

    await waitFor(() => {
      expect(screen.getByText(/Password changed successfully/i)).toBeInTheDocument()
    })
  })
})
