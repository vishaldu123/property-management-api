import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components'
import { usePermissionGate } from '@/shared/hooks'
import { REPORT_DEFINITIONS } from '../constants'
import { ChartBarSquareIcon } from '@heroicons/react/24/outline'

export const ReportsHomePage: React.FC = () => {
  const { canPerform } = usePermissionGate()

  const visibleReports = useMemo(
    () => REPORT_DEFINITIONS.filter(r => canPerform(r.permission)),
    [canPerform]
  )

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Enterprise reporting workspace for occupancy, revenue, payments, leases, tenants,
          maintenance, and property performance.
        </p>
      </header>

      <section
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        aria-label="Available reports"
      >
        {visibleReports.map(report => (
          <Link
            key={report.id}
            to={report.href}
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Open ${report.title}`}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start gap-3">
                <ChartBarSquareIcon className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription className="mt-1">{report.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary font-medium">View report →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {visibleReports.length === 0 && (
        <p className="text-muted-foreground" role="status">
          You do not have permission to view any reports.
        </p>
      )}
    </div>
  )
}
