import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  RoleGate,
  Skeleton,
} from '@/shared/components'
import { useRbac } from '@/shared/hooks'
import { isApiError, toastService } from '@/shared/services'
import { AdminLayout } from './admin-layout'
import { useDevDataSummary, useResetDemoData, useSeedDemoData } from '../hooks/use-dev-tools'
import type { DevToolsDataCounts } from '../types'
import { isDevToolsEnabled } from '../utils/dev-tools.utils'
import {
  ArrowPathIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

const COUNT_LABELS: Array<{ key: keyof DevToolsDataCounts; label: string }> = [
  { key: 'properties', label: 'Properties' },
  { key: 'units', label: 'Units' },
  { key: 'tenants', label: 'Tenants' },
  { key: 'leases', label: 'Leases' },
  { key: 'payments', label: 'Payments' },
  { key: 'maintenanceRequests', label: 'Maintenance' },
]

function CountGrid({ counts, isLoading }: { counts?: DevToolsDataCounts; isLoading?: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {COUNT_LABELS.map(({ key, label }) => (
        <div key={key} className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-12 mt-2" />
          ) : (
            <p className="text-2xl font-semibold mt-1">{counts?.[key] ?? 0}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export const DemoDataPage: React.FC = () => {
  const navigate = useNavigate()
  const { getUserRoleIdentifiers } = useRbac()
  const devToolsEnabled = isDevToolsEnabled()
  const [resetConfirmed, setResetConfirmed] = useState(false)
  const [replaceExisting, setReplaceExisting] = useState(false)

  const userRoles = getUserRoleIdentifiers()

  const { data: summary, isLoading, isError, refetch } = useDevDataSummary(devToolsEnabled)
  const seedMutation = useSeedDemoData()
  const resetMutation = useResetDemoData()

  const hasData = summary ? Object.values(summary).some(count => count > 0) : false

  const handleSeed = async () => {
    try {
      const result = await seedMutation.mutateAsync(replaceExisting)
      toastService.success(
        `Demo data seeded: ${result.properties} properties, ${result.units} units, ${result.tenants} tenants`
      )
      navigate('/dashboard')
    } catch (error) {
      const message = isApiError(error)
        ? error.response?.data?.message || 'Failed to seed demo data'
        : 'Failed to seed demo data'
      toastService.error(message)
    }
  }

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync()
      setResetConfirmed(false)
      toastService.success('All portfolio data was removed from your organization')
    } catch (error) {
      const message = isApiError(error)
        ? error.response?.data?.message || 'Failed to reset data'
        : 'Failed to reset data'
      toastService.error(message)
    }
  }

  if (!devToolsEnabled) {
    return (
      <AdminLayout title="Demo Data" description="Developer tools are disabled in this environment">
        <Alert>
          <AlertDescription>
            Demo data tools are only available in development builds or when{' '}
            <code className="text-xs">VITE_ENABLE_DEV_TOOLS=true</code> is set.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    )
  }

  return (
    <RoleGate
      roles={['organization_owner', 'organization_admin', 'super_admin']}
      userRoles={userRoles}
      fallback={
        <AdminLayout title="Demo Data" description="Access restricted">
          <p className="text-muted-foreground">
            Only organization owners and administrators can manage demo data.
          </p>
        </AdminLayout>
      }
    >
      <AdminLayout
        title="Demo Data"
        description="Seed sample portfolio data for testing or reset your organization back to a clean slate"
      >
        <div className="space-y-6">
          <Alert>
            <BeakerIcon className="h-4 w-4" />
            <AlertDescription>
              These tools affect <strong>your organization only</strong>. Users, roles, and settings
              are preserved. Reset removes all properties, units, tenants, leases, payments, and
              maintenance requests.
            </AlertDescription>
          </Alert>

          {isError && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span>
                  Unable to load data summary. Ensure the API is running and dev tools are enabled
                  on the backend (<code className="text-xs">ENABLE_DEV_TOOLS=true</code> in
                  production).
                </span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Current portfolio</CardTitle>
                <CardDescription>Record counts for your organization</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                aria-label="Refresh counts"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <CountGrid counts={summary} isLoading={isLoading} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seed demo data</CardTitle>
                <CardDescription>
                  Adds 2 properties, 6 units, 4 tenants, 3 leases, 5 payments, and 3 maintenance
                  requests with realistic statuses for dashboard and report testing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasData && (
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={replaceExisting}
                      onChange={e => setReplaceExisting(e.target.checked)}
                    />
                    <span>
                      Replace existing data (reset portfolio first, then seed fresh demo records)
                    </span>
                  </label>
                )}
                <Button
                  onClick={handleSeed}
                  disabled={seedMutation.isPending || (hasData && !replaceExisting)}
                  aria-busy={seedMutation.isPending}
                >
                  <BeakerIcon className="h-4 w-4 mr-2" />
                  {seedMutation.isPending ? 'Seeding…' : 'Seed demo data'}
                </Button>
                {hasData && !replaceExisting && (
                  <p className="text-xs text-muted-foreground">
                    Your organization already has data. Enable replace, or reset first.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Reset portfolio data</CardTitle>
                <CardDescription>
                  Permanently deletes all properties, units, tenants, leases, payments, and
                  maintenance requests. This cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={resetConfirmed}
                    onChange={e => setResetConfirmed(e.target.checked)}
                  />
                  <span>I understand this will delete all portfolio data for my organization</span>
                </label>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  disabled={!resetConfirmed || resetMutation.isPending || !hasData}
                  aria-busy={resetMutation.isPending}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {resetMutation.isPending ? 'Resetting…' : 'Reset all data'}
                </Button>
                {!hasData && (
                  <p className="text-xs text-muted-foreground">
                    Nothing to reset — portfolio is already empty.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </RoleGate>
  )
}
