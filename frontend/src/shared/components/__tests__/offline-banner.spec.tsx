import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { OfflineBanner } from '@/shared/components/offline-banner'

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value,
  })
}

describe('OfflineBanner', () => {
  afterEach(() => {
    setOnline(true)
    vi.restoreAllMocks()
  })

  it('renders nothing when online', () => {
    setOnline(true)
    const { container } = render(<OfflineBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows an alert when the browser goes offline', () => {
    setOnline(true)
    render(<OfflineBanner />)

    act(() => {
      setOnline(false)
      window.dispatchEvent(new Event('offline'))
    })

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/offline/i)
  })

  it('hides again once the connection is restored', () => {
    setOnline(false)
    render(<OfflineBanner />)
    expect(screen.getByRole('alert')).toBeInTheDocument()

    act(() => {
      setOnline(true)
      window.dispatchEvent(new Event('online'))
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
