import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, useRbac } from '@/shared/hooks'
import { Loading } from '@/shared/components/ui'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { getUserRoleIdentifiers } = useRbac()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" role="status" aria-live="polite">
        <Loading size="lg" />
        <span className="sr-only">Loading your session…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = getUserRoleIdentifiers()
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

    if (!hasRequiredRole) {
      return <Navigate to="/forbidden" replace />
    }
  }

  return <>{children}</>
}
