import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks'
import { Loading } from '@/shared/components/ui'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  console.log('[ProtectedRoute] Rendering:', { isLoading, isAuthenticated, hasUser: !!user })

  if (isLoading) {
    console.log('[ProtectedRoute] Showing loading spinner')
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting to login - not authenticated')
    return <Navigate to="/login" replace />
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user?.roles.map(r => r.role?.name).filter(Boolean) || []
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

    if (!hasRequiredRole) {
      console.log('[ProtectedRoute] Redirecting to forbidden - missing required role')
      return <Navigate to="/forbidden" replace />
    }
  }

  console.log('[ProtectedRoute] Rendering protected content')
  return <>{children}</>
}
