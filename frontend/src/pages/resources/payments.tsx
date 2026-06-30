import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@/shared/components'
import { PlusIcon } from '@heroicons/react/24/outline'

export const PaymentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-2">Track and manage all payments</p>
        </div>
        <Button className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <div className="text-2xl font-bold">$—</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <div className="text-2xl font-bold">$—</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="text-2xl font-bold">$—</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Not yet due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <div className="text-2xl font-bold">—%</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">On-time payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Payment management interface will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
