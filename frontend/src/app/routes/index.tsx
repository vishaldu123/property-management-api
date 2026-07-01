import React, { Suspense, lazy } from 'react'
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Loading } from '@/shared/components/ui'
import { ProtectedRoute } from './protected-route'
import { AppLayout } from './app-layout'
import { ErrorBoundary } from '../error-boundary'

/**
 * Route-level code splitting.
 *
 * Every page is loaded on demand so the initial JavaScript payload only
 * contains the shell (router, providers, layout). `named` adapts our
 * named page exports to the default export shape that `React.lazy` expects.
 */
function named<T, K extends keyof T>(factory: () => Promise<T>, name: K) {
  return lazy(() =>
    factory().then(module => ({
      default: module[name] as unknown as React.ComponentType<Record<string, unknown>>,
    }))
  )
}

// Auth + top-level pages
const HomePage = named(() => import('@/pages'), 'HomePage')
const LoginPage = named(() => import('@/pages'), 'LoginPage')
const RegisterPage = named(() => import('@/pages'), 'RegisterPage')
const ForgotPasswordPage = named(() => import('@/pages'), 'ForgotPasswordPage')
const ResetPasswordPage = named(() => import('@/pages'), 'ResetPasswordPage')
const DashboardPage = named(() => import('@/pages'), 'DashboardPage')
const NotFoundPage = named(() => import('@/pages'), 'NotFoundPage')
const ForbiddenPage = named(() => import('@/pages'), 'ForbiddenPage')
const LeasesPage = named(() => import('@/pages'), 'LeasesPage')

// Property
const PropertyListPage = named(() => import('@/features'), 'PropertyListPage')
const PropertyDetailPage = named(() => import('@/features'), 'PropertyDetailPage')
const PropertyFormPage = named(() => import('@/features'), 'PropertyFormPage')

// Unit
const UnitListPage = named(() => import('@/features'), 'UnitListPage')
const UnitDetailPage = named(() => import('@/features'), 'UnitDetailPage')
const UnitFormPage = named(() => import('@/features'), 'UnitFormPage')

// Tenant
const TenantListPage = named(() => import('@/features'), 'TenantListPage')
const TenantDetailPage = named(() => import('@/features'), 'TenantDetailPage')
const TenantFormPage = named(() => import('@/features'), 'TenantFormPage')

// Payment
const PaymentListPage = named(() => import('@/features'), 'PaymentListPage')
const PaymentDetailPage = named(() => import('@/features'), 'PaymentDetailPage')
const PaymentFormPage = named(() => import('@/features'), 'PaymentFormPage')

// Maintenance
const MaintenanceListPage = named(() => import('@/features'), 'MaintenanceListPage')
const MaintenanceDetailPage = named(() => import('@/features'), 'MaintenanceDetailPage')
const MaintenanceFormPage = named(() => import('@/features'), 'MaintenanceFormPage')

// Reports
const ReportsHomePage = named(() => import('@/features'), 'ReportsHomePage')
const OccupancyReportPage = named(() => import('@/features'), 'OccupancyReportPage')
const RevenueReportPage = named(() => import('@/features'), 'RevenueReportPage')
const PaymentReportPage = named(() => import('@/features'), 'PaymentReportPage')
const LeaseReportPage = named(() => import('@/features'), 'LeaseReportPage')
const TenantReportPage = named(() => import('@/features'), 'TenantReportPage')
const MaintenanceReportPage = named(() => import('@/features'), 'MaintenanceReportPage')
const PropertyPerformanceReportPage = named(
  () => import('@/features'),
  'PropertyPerformanceReportPage'
)

// Administration
const AdministrationHomePage = named(() => import('@/features'), 'AdministrationHomePage')
const OrganizationSettingsPage = named(() => import('@/features'), 'OrganizationSettingsPage')
const OrganizationBrandingPage = named(() => import('@/features'), 'OrganizationBrandingPage')
const UserManagementPage = named(() => import('@/features'), 'UserManagementPage')
const InvitationManagementPage = named(() => import('@/features'), 'InvitationManagementPage')
const RoleAssignmentPage = named(() => import('@/features'), 'RoleAssignmentPage')
const SecuritySettingsPage = named(() => import('@/features'), 'SecuritySettingsPage')
const ChangePasswordPage = named(() => import('@/features'), 'ChangePasswordPage')
const ProfileSettingsPage = named(() => import('@/features'), 'ProfileSettingsPage')
const AppearanceSettingsPage = named(() => import('@/features'), 'AppearanceSettingsPage')
const NotificationPreferencesPage = named(() => import('@/features'), 'NotificationPreferencesPage')
const SessionManagementPage = named(() => import('@/features'), 'SessionManagementPage')
const AuditLogPage = named(() => import('@/features'), 'AuditLogPage')
const AboutPage = named(() => import('@/features'), 'AboutPage')

const RouteFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen" role="status" aria-live="polite">
    <Loading size="lg" />
    <span className="sr-only">Loading page…</span>
  </div>
)

/** Wraps a lazy page in Suspense so route transitions show a fallback. */
const suspense = (node: React.ReactNode): React.ReactElement => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: suspense(<HomePage />),
    errorElement: suspense(<NotFoundPage />),
  },
  {
    path: '/login',
    element: <ErrorBoundary>{suspense(<LoginPage />)}</ErrorBoundary>,
  },
  {
    path: '/register',
    element: <ErrorBoundary>{suspense(<RegisterPage />)}</ErrorBoundary>,
  },
  {
    path: '/forgot-password',
    element: <ErrorBoundary>{suspense(<ForgotPasswordPage />)}</ErrorBoundary>,
  },
  {
    path: '/reset-password',
    element: <ErrorBoundary>{suspense(<ResetPasswordPage />)}</ErrorBoundary>,
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
      { path: '/dashboard', element: suspense(<DashboardPage />) },
      { path: '/profile', element: <Navigate to="/admin/profile" replace /> },
      { path: '/settings', element: <Navigate to="/admin" replace /> },
      { path: '/properties', element: suspense(<PropertyListPage />) },
      { path: '/properties/create', element: suspense(<PropertyFormPage mode="create" />) },
      { path: '/properties/:id', element: suspense(<PropertyDetailPage />) },
      { path: '/properties/:id/edit', element: suspense(<PropertyFormPage mode="edit" />) },
      { path: '/units', element: suspense(<UnitListPage />) },
      { path: '/units/create', element: suspense(<UnitFormPage mode="create" />) },
      { path: '/units/:id', element: suspense(<UnitDetailPage />) },
      { path: '/units/:id/edit', element: suspense(<UnitFormPage mode="edit" />) },
      { path: '/tenants', element: suspense(<TenantListPage />) },
      { path: '/tenants/create', element: suspense(<TenantFormPage mode="create" />) },
      { path: '/tenants/:id', element: suspense(<TenantDetailPage />) },
      { path: '/tenants/:id/edit', element: suspense(<TenantFormPage mode="edit" />) },
      { path: '/organization/members', element: <Navigate to="/admin/users" replace /> },
      { path: '/rbac', element: <Navigate to="/admin/roles" replace /> },
      { path: '/leases', element: suspense(<LeasesPage />) },
      { path: '/payments', element: suspense(<PaymentListPage />) },
      { path: '/payments/create', element: suspense(<PaymentFormPage mode="create" />) },
      { path: '/payments/:id', element: suspense(<PaymentDetailPage />) },
      { path: '/payments/:id/edit', element: suspense(<PaymentFormPage mode="edit" />) },
      { path: '/maintenance', element: suspense(<MaintenanceListPage />) },
      { path: '/maintenance/create', element: suspense(<MaintenanceFormPage mode="create" />) },
      { path: '/maintenance/:id', element: suspense(<MaintenanceDetailPage />) },
      { path: '/maintenance/:id/edit', element: suspense(<MaintenanceFormPage mode="edit" />) },
      { path: '/reports', element: suspense(<ReportsHomePage />) },
      { path: '/reports/occupancy', element: suspense(<OccupancyReportPage />) },
      { path: '/reports/revenue', element: suspense(<RevenueReportPage />) },
      { path: '/reports/payments', element: suspense(<PaymentReportPage />) },
      { path: '/reports/leases', element: suspense(<LeaseReportPage />) },
      { path: '/reports/tenants', element: suspense(<TenantReportPage />) },
      { path: '/reports/maintenance', element: suspense(<MaintenanceReportPage />) },
      {
        path: '/reports/property-performance',
        element: suspense(<PropertyPerformanceReportPage />),
      },
      { path: '/admin', element: suspense(<AdministrationHomePage />) },
      { path: '/admin/organization/settings', element: suspense(<OrganizationSettingsPage />) },
      { path: '/admin/organization/branding', element: suspense(<OrganizationBrandingPage />) },
      { path: '/admin/users', element: suspense(<UserManagementPage />) },
      { path: '/admin/invitations', element: suspense(<InvitationManagementPage />) },
      { path: '/admin/roles', element: suspense(<RoleAssignmentPage />) },
      { path: '/admin/security', element: suspense(<SecuritySettingsPage />) },
      { path: '/admin/security/password', element: suspense(<ChangePasswordPage />) },
      { path: '/admin/security/sessions', element: suspense(<SessionManagementPage />) },
      { path: '/admin/profile', element: suspense(<ProfileSettingsPage />) },
      { path: '/admin/appearance', element: suspense(<AppearanceSettingsPage />) },
      { path: '/admin/notifications', element: suspense(<NotificationPreferencesPage />) },
      { path: '/admin/audit', element: suspense(<AuditLogPage />) },
      { path: '/admin/about', element: suspense(<AboutPage />) },
    ],
  },
  {
    path: '/forbidden',
    element: suspense(<ForbiddenPage />),
  },
  {
    path: '*',
    element: suspense(<NotFoundPage />),
  },
])

export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />
}
