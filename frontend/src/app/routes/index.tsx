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
  OrganizationMembersPage,
  RbacPage,
  LeasesPage,
  PaymentsPage,
  MaintenancePage,
  NotFoundPage,
  ForbiddenPage,
} from '@/pages'
import {
  PropertyListPage,
  PropertyDetailPage,
  PropertyFormPage,
  UnitListPage,
  UnitDetailPage,
  UnitFormPage,
  TenantListPage,
  TenantDetailPage,
  TenantFormPage,
} from '@/features'
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
  // Property Routes
  {
    path: '/properties',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <PropertyListPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/properties/create',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <PropertyFormPage mode="create" />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/properties/:id',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <PropertyDetailPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/properties/:id/edit',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <PropertyFormPage mode="edit" />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  // Unit Routes
  {
    path: '/units',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <UnitListPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/units/create',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <UnitFormPage mode="create" />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/units/:id',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <UnitDetailPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/units/:id/edit',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <UnitFormPage mode="edit" />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  // Tenant Routes
  {
    path: '/tenants',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <TenantListPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/tenants/create',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <TenantFormPage mode="create" />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/tenants/:id',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <TenantDetailPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/tenants/:id/edit',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <TenantFormPage mode="edit" />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  // Organization Routes
  {
    path: '/organization/members',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <OrganizationMembersPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  // RBAC Routes
  {
    path: '/rbac',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <RbacPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  // Leases Routes
  {
    path: '/leases',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <LeasesPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  // Payments Routes
  {
    path: '/payments',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <PaymentsPage />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  // Maintenance Routes
  {
    path: '/maintenance',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <MaintenancePage />
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
