import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  DashboardLayout,
} from '@/shared/components'
import { PlusIcon } from '@heroicons/react/24/outline'

export const MaintenancePage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-muted-foreground mt-2">Track and manage maintenance requests</p>
          </div>
          <Button className="gap-2">
            <PlusIcon className="w-4 h-4" />
            New Request
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
              <div className="text-2xl font-bold">—</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <div className="text-2xl font-bold">—</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="text-2xl font-bold">—</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost</CardTitle>
              <div className="text-2xl font-bold">$—</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Per request</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Requests</CardTitle>
            <CardDescription>Track all maintenance requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Maintenance management interface will be available in the next update.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
