import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DashboardLayout,
  SkeletonCard,
} from '@/shared/components'
import { useAuth } from '@/shared/hooks'

export const DashboardPage: React.FC = () => {
  const { user, currentOrganization, isLoading } = useAuth()

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.firstName}!</h1>
          <p className="text-muted-foreground mt-2">
            {currentOrganization
              ? `Organization: ${currentOrganization.name}`
              : 'Property management dashboard'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <div className="text-2xl font-bold">—</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Properties you manage</p>
              <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <div className="text-2xl font-bold">—</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Active tenant agreements</p>
              <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leases</CardTitle>
              <div className="text-2xl font-bold">—</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Awaiting signatures</p>
              <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
              <div className="text-2xl font-bold">$—</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Overdue amounts</p>
              <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to Property Management</CardTitle>
            <CardDescription>Your complete SaaS platform is ready</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Authentication system (login, register, forgot password)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Organization management with multi-tenant support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Role-based access control (RBAC) with flexible permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Organization settings, branding, and preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">→</span>
                <span>Properties, units, tenants, and leases (coming next)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
