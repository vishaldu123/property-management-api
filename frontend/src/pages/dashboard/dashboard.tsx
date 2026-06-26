import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, DashboardLayout } from '@/shared/components'
import { useAuth } from '@/shared/hooks'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.firstName}!</h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your property management system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <div className="text-2xl font-bold">0</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Properties you manage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <div className="text-2xl font-bold">0</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Active tenant agreements</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leases</CardTitle>
              <div className="text-2xl font-bold">0</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Awaiting signatures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
              <div className="text-2xl font-bold">$0</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Overdue amounts</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with your property management</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Set up your organization settings</li>
              <li>✓ Configure your organization branding</li>
              <li>✓ Manage your team members and their roles</li>
              <li>✓ Create your first property</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
