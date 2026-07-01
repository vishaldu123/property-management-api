import React from 'react'
import { useOnlineStatus } from '@/shared/hooks/use-online-status'

/**
 * Fixed banner that appears when the browser loses network connectivity.
 * Uses an assertive live region so screen readers announce the state change.
 */
export const OfflineBanner: React.FC = () => {
  const online = useOnlineStatus()

  if (online) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 top-0 z-[100] bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground shadow-md"
    >
      You are offline. Some features may be unavailable until your connection is restored.
    </div>
  )
}
