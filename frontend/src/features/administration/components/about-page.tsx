import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components'
import { AdminLayout } from './admin-layout'
import { useSystemHealth } from '../hooks/use-administration'
import { getSystemInfo } from '../utils/administration.utils'

export const AboutPage: React.FC = () => {
  const localInfo = getSystemInfo()
  const { data: health, isError } = useSystemHealth()

  return (
    <AdminLayout
      title="About / System Information"
      description="Application version, environment, and runtime details"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Frontend Version</dt>
              <dd className="font-medium">{localInfo.frontendVersion}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Backend Version</dt>
              <dd className="font-medium">
                {isError ? 'Unavailable' : (health?.version ?? 'Loading…')}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Environment</dt>
              <dd className="font-medium">{health?.environment ?? localInfo.environment}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Build Date</dt>
              <dd className="font-medium">{localInfo.buildDate}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Browser</dt>
              <dd className="font-medium break-all">{localInfo.browser}</dd>
            </div>
            {health?.status && (
              <div>
                <dt className="text-muted-foreground">Backend Status</dt>
                <dd className="font-medium capitalize">{health.status}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
