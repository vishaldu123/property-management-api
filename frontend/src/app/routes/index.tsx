import React from 'react'
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
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
  MaintenanceListPage,
  MaintenanceDetailPage,
  MaintenanceFormPage,
  ReportsHomePage,
  OccupancyReportPage,
  RevenueReportPage,
  PaymentReportPage,
  LeaseReportPage,
  TenantReportPage,
  MaintenanceReportPage,
  PropertyPerformanceReportPage,
  AdministrationHomePage,
  OrganizationSettingsPage,
  OrganizationBrandingPage,
  UserManagementPage,
  InvitationManagementPage,
  RoleAssignmentPage,
  SecuritySettingsPage,
  ChangePasswordPage,
  ProfileSettingsPage,
  AppearanceSettingsPage,
  NotificationPreferencesPage,
  SessionManagementPage,
  AuditLogPage,
  AboutPage,
} from '@/features'
import { LeasesPage } from '@/pages'
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
      { path: '/profile', element: <Navigate to="/admin/profile" replace /> },
      { path: '/settings', element: <Navigate to="/admin" replace /> },
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
      { path: '/organization/members', element: <Navigate to="/admin/users" replace /> },
      { path: '/rbac', element: <Navigate to="/admin/roles" replace /> },
      { path: '/leases', element: <LeasesPage /> },
      { path: '/payments', element: <PaymentListPage /> },
      { path: '/payments/create', element: <PaymentFormPage mode="create" /> },
      { path: '/payments/:id', element: <PaymentDetailPage /> },
      { path: '/payments/:id/edit', element: <PaymentFormPage mode="edit" /> },
      { path: '/maintenance', element: <MaintenanceListPage /> },
      { path: '/maintenance/create', element: <MaintenanceFormPage mode="create" /> },
      { path: '/maintenance/:id', element: <MaintenanceDetailPage /> },
      { path: '/maintenance/:id/edit', element: <MaintenanceFormPage mode="edit" /> },
      { path: '/reports', element: <ReportsHomePage /> },
      { path: '/reports/occupancy', element: <OccupancyReportPage /> },
      { path: '/reports/revenue', element: <RevenueReportPage /> },
      { path: '/reports/payments', element: <PaymentReportPage /> },
      { path: '/reports/leases', element: <LeaseReportPage /> },
      { path: '/reports/tenants', element: <TenantReportPage /> },
      { path: '/reports/maintenance', element: <MaintenanceReportPage /> },
      { path: '/reports/property-performance', element: <PropertyPerformanceReportPage /> },
      { path: '/admin', element: <AdministrationHomePage /> },
      { path: '/admin/organization/settings', element: <OrganizationSettingsPage /> },
      { path: '/admin/organization/branding', element: <OrganizationBrandingPage /> },
      { path: '/admin/users', element: <UserManagementPage /> },
      { path: '/admin/invitations', element: <InvitationManagementPage /> },
      { path: '/admin/roles', element: <RoleAssignmentPage /> },
      { path: '/admin/security', element: <SecuritySettingsPage /> },
      { path: '/admin/security/password', element: <ChangePasswordPage /> },
      { path: '/admin/security/sessions', element: <SessionManagementPage /> },
      { path: '/admin/profile', element: <ProfileSettingsPage /> },
      { path: '/admin/appearance', element: <AppearanceSettingsPage /> },
      { path: '/admin/notifications', element: <NotificationPreferencesPage /> },
      { path: '/admin/audit', element: <AuditLogPage /> },
      { path: '/admin/about', element: <AboutPage /> },
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
