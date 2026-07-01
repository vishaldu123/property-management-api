import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { maintenanceService, type MaintenanceRequest } from '@/shared/services'
import { toastService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components'
import { usePermissionGate } from '@/shared/hooks'
import { MaintenanceList } from './maintenance-list'
import { AssignTechnicianDialog } from './assign-technician-dialog'
import { useInvalidateMaintenance, useMaintenanceStats } from '../hooks/use-maintenance'
import { exportMaintenancePlaceholder } from '../utils/maintenance.utils'

export const MaintenanceListPage: React.FC = () => {
  const navigate = useNavigate()
  const { canPerform } = usePermissionGate()
  const { invalidateList } = useInvalidateMaintenance()
  const { data: stats, isLoading: statsLoading } = useMaintenanceStats()

  const [assignTarget, setAssignTarget] = React.useState<MaintenanceRequest | null>(null)
  const [bulkAssignIds, setBulkAssignIds] = React.useState<string[] | null>(null)

  const assignMutation = useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId: string }) =>
      maintenanceService.assignTechnician(id, technicianId),
    onSuccess: () => {
      toastService.success('Technician assigned successfully')
      setAssignTarget(null)
      setBulkAssignIds(null)
      invalidateList()
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  const handleBulkAssign = (ids: string[]) => setBulkAssignIds(ids)

  const handleBulkClose = async (ids: string[]) => {
    if (!confirm(`Attempt to close ${ids.length} request(s)?`)) return
    for (const id of ids) {
      try {
        await maintenanceService.changeStatus(id, 'Completed')
      } catch {
        toastService.error(`Could not close request ${id} — invalid status transition`)
      }
    }
    toastService.success('Bulk close completed')
    invalidateList()
  }

  const handleExport = (requests: MaintenanceRequest[]) => {
    const csv = exportMaintenancePlaceholder(requests)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `maintenance-export-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toastService.info(`Exported ${requests.length} request(s)`)
  }

  const handleAssignConfirm = (technicianId: string) => {
    if (assignTarget) {
      assignMutation.mutate({ id: assignTarget.id, technicianId })
    } else if (bulkAssignIds) {
      bulkAssignIds.forEach(id => assignMutation.mutate({ id, technicianId }))
    }
  }

  const openCount =
    (stats?.byStatus.Open ?? 0) +
    (stats?.byStatus.Assigned ?? 0) +
    (stats?.byStatus.Scheduled ?? 0) +
    (stats?.byStatus['In Progress'] ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground mt-2">Track and manage maintenance requests</p>
        </div>
        {canPerform('maintenance:create') && (
          <Button onClick={() => navigate('/maintenance/create')}>+ New Request</Button>
        )}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Maintenance statistics"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statsLoading ? '—' : openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {statsLoading ? '—' : (stats?.byStatus['In Progress'] ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {statsLoading ? '—' : (stats?.byStatus.Completed ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actual Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {statsLoading ? '—' : `$${(stats?.totalActualCost ?? 0).toLocaleString()}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <MaintenanceList
        onView={id => navigate(`/maintenance/${id}`)}
        onEdit={
          canPerform('maintenance:update') ? id => navigate(`/maintenance/${id}/edit`) : undefined
        }
        onAssign={canPerform('maintenance:assign') ? setAssignTarget : undefined}
        onBulkAssign={canPerform('maintenance:assign') ? handleBulkAssign : undefined}
        onBulkClose={canPerform('maintenance:update') ? handleBulkClose : undefined}
        onExport={canPerform('maintenance:view') ? handleExport : undefined}
      />

      <AssignTechnicianDialog
        open={!!assignTarget || !!bulkAssignIds}
        onOpenChange={open => {
          if (!open) {
            setAssignTarget(null)
            setBulkAssignIds(null)
          }
        }}
        isLoading={assignMutation.isPending}
        onConfirm={handleAssignConfirm}
        title={bulkAssignIds ? `Assign ${bulkAssignIds.length} requests` : 'Assign Technician'}
      />
    </div>
  )
}
