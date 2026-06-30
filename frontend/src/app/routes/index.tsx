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
  PaymentListPage,
  PaymentDetailPage,
  PaymentFormPage,
} from '@/features'
import { ProtectedRoute } from './protected-route'
import { AppLayout } from './app-layout'
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
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/properties', element: <PropertyListPage /> },
      { path: '/properties/create', element: <PropertyFormPage mode="create" /> },
      { path: '/properties/:id', element: <PropertyDetailPage /> },
      { path: '/properties/:id/edit', element: <PropertyFormPage mode="edit" /> },
      { path: '/units', element: <UnitListPage /> },
      { path: '/units/create', element: <UnitFormPage mode="create" /> },
      { path: '/units/:id', element: <UnitDetailPage /> },
      { path: '/units/:id/edit', element: <UnitFormPage mode="edit" /> },
      { path: '/tenants', element: <TenantListPage /> },
      { path: '/tenants/create', element: <TenantFormPage mode="create" /> },
      { path: '/tenants/:id', element: <TenantDetailPage /> },
      { path: '/tenants/:id/edit', element: <TenantFormPage mode="edit" /> },
      { path: '/organization/members', element: <OrganizationMembersPage /> },
      { path: '/rbac', element: <RbacPage /> },
      { path: '/leases', element: <LeasesPage /> },
      { path: '/payments', element: <PaymentListPage /> },
      { path: '/payments/create', element: <PaymentFormPage mode="create" /> },
      { path: '/payments/:id', element: <PaymentDetailPage /> },
      { path: '/payments/:id/edit', element: <PaymentFormPage mode="edit" /> },
      { path: '/maintenance', element: <MaintenancePage /> },
    ],
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
