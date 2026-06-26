import React from 'react'
import { ErrorState, Button } from '@/shared/components'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-background">
          <ErrorState
            title="Application Error"
            message={this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
            action={
              <Button onClick={() => window.location.href = '/'}>
                Go to Home
              </Button>
            }
          />
        </div>
      )
    }

    return this.props.children
  }
}
