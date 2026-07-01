import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/app/providers'
import { AppRoutes } from '@/app/routes'
import { ErrorBoundary } from '@/app/error-boundary'
import { ToastContainer, OfflineBanner } from '@/shared/components'
import '@/app/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      // Do not retry client errors (4xx); retry transient failures up to twice.
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status && status >= 400 && status < 500) {
          return false
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OfflineBanner />
          <AppRoutes />
          <ToastContainer />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
