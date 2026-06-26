import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  ProfilePage,
  SettingsPage,
  NotFoundPage,
  ForbiddenPage,
} from '@/pages'
import { ProtectedRoute } from './protected-route'
import { ErrorBoundary } from '../error-boundary'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/login',
    element: (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    ),
  },
  {
    path: '/register',
    element: (
      <ErrorBoundary>
        <RegisterPage />
      </ErrorBoundary>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <ErrorBoundary>
        <ForgotPasswordPage />
      </ErrorBoundary>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <ErrorBoundary>
        <ResetPasswordPage />
      </ErrorBoundary>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/profile',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/settings',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />
}
