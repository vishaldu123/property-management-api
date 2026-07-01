import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import {
  maintenanceService,
  propertyService,
  tenantService,
  unitService,
  organizationService,
  type MaintenanceStatus,
} from '@/shared/services'
import { toastService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { usePermissionGate, useAuth } from '@/shared/hooks'
import { useMaintenanceDetail, useInvalidateMaintenance } from '../hooks/use-maintenance'
import { MaintenanceTimeline } from './maintenance-timeline'
import { CostTrackingCard } from './cost-tracking-card'
import { AssignTechnicianDialog } from './assign-technician-dialog'
import { ConfirmDialog } from './modal'
import {
  formatMaintenanceCurrency,
  formatMaintenanceDate,
  getAllowedTransitions,
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from '../utils/maintenance.utils'

export const MaintenanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { canPerform } = usePermissionGate()
  const { currentOrganization } = useAuth()
  const { invalidateDetail, invalidateList } = useInvalidateMaintenance()

  const [showAssign, setShowAssign] = React.useState(false)
  const [pendingStatus, setPendingStatus] = React.useState<MaintenanceStatus | null>(null)

  const { data: request, isLoading, isError, error } = useMaintenanceDetail(id)

  const { data: property } = useQuery({
    queryKey: ['property', request?.propertyId],
    queryFn: () => propertyService.getProperty(request!.propertyId),
    enabled: !!request?.propertyId,
  })

  const { data: unit } = useQuery({
    queryKey: ['unit', request?.unitId],
    queryFn: () => unitService.getUnit(request!.unitId!),
    enabled: !!request?.unitId,
  })

  const { data: tenant } = useQuery({
    queryKey: ['tenant', request?.tenantId],
    queryFn: () => tenantService.getTenant(request!.tenantId!),
    enabled: !!request?.tenantId,
  })

  const { data: membersData } = useQuery({
    queryKey: ['org-members', currentOrganization?.id],
    queryFn: () => organizationService.listMembers(currentOrganization!.id, { limit: 100 }),
    enabled: !!currentOrganization?.id && !!request?.assignedTo,
  })

  const technicianName = membersData?.data.find(m => m.userId === request?.assignedTo)?.user?.name

  const deleteMutation = useMutation({
    mutationFn: () => maintenanceService.deleteMaintenance(id!),
    onSuccess: () => {
      toastService.success('Request deleted')
      navigate('/maintenance')
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  const restoreMutation = useMutation({
    mutationFn: () => maintenanceService.restoreMaintenance(id!),
    onSuccess: () => {
      toastService.success('Request restored')
      invalidateDetail(id!)
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  const assignMutation = useMutation({
    mutationFn: (technicianId: string) => maintenanceService.assignTechnician(id!, technicianId),
    onSuccess: () => {
      toastService.success('Technician assigned')
      setShowAssign(false)
      invalidateDetail(id!)
      invalidateList()
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  const statusMutation = useMutation({
    mutationFn: (status: MaintenanceStatus) => maintenanceService.changeStatus(id!, status),
    onSuccess: () => {
      toastService.success('Status updated')
      setPendingStatus(null)
      invalidateDetail(id!)
      invalidateList()
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Error loading maintenance request"
        message={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  if (!request) {
    return <ErrorState title="Request not found" message="The maintenance request does not exist" />
  }

  const allowedTransitions = getAllowedTransitions(request.status)

  const statusActionLabel: Partial<Record<MaintenanceStatus, string>> = {
    Assigned: 'Assign',
    Scheduled: 'Schedule',
    'In Progress': 'Start Work',
    'On Hold': 'Pause',
    Completed: 'Complete',
    Cancelled: 'Cancel',
    Open: 'Reopen',
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{request.requestNumber}</h1>
          <p className="text-lg text-muted-foreground mt-1">{request.title}</p>
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-1 rounded text-sm ${getStatusBadgeClass(request.status)}`}>
              {request.status}
            </span>
            <span
              className={`px-2 py-1 rounded text-sm ${getPriorityBadgeClass(request.priority)}`}
            >
              {request.priority}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPerform('maintenance:update') &&
            !['Completed', 'Cancelled'].includes(request.status) && (
              <Button variant="outline" onClick={() => navigate(`/maintenance/${id}/edit`)}>
                Edit
              </Button>
            )}
          {canPerform('maintenance:assign') && request.status === 'Open' && (
            <Button onClick={() => setShowAssign(true)}>Assign</Button>
          )}
          {canPerform('maintenance:update') &&
            allowedTransitions
              .filter(status => status !== 'Assigned' || request.status !== 'Open')
              .map(status => (
                <Button key={status} variant="outline" onClick={() => setPendingStatus(status)}>
                  {statusActionLabel[status] ?? status}
                </Button>
              ))}
          {canPerform('maintenance:update') && !request.deletedAt && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Delete this maintenance request?')) deleteMutation.mutate()
              }}
            >
              Delete
            </Button>
          )}
          {request.deletedAt && canPerform('maintenance:update') && (
            <Button variant="outline" onClick={() => restoreMutation.mutate()}>
              Restore
            </Button>
          )}
        </div>
      </div>

      {request.deletedAt && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-800">
          This request has been deleted.
        </div>
      )}

      <CostTrackingCard request={request} />

      <Tabs defaultValue="details">
        <TabsList aria-label="Maintenance sections">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
            <DetailField label="Category" value={request.category} />
            <DetailField label="Property" value={property?.name ?? '—'} />
            <DetailField label="Unit" value={unit?.unitNumber ?? '—'} />
            <DetailField
              label="Tenant"
              value={tenant ? `${tenant.firstName} ${tenant.lastName}` : '—'}
            />
            <DetailField label="Assigned Technician" value={technicianName ?? '—'} />
            <DetailField label="Vendor" value={request.vendor ?? '—'} />
            <DetailField
              label="Estimated Cost"
              value={formatMaintenanceCurrency(request.estimatedCost)}
            />
            <DetailField
              label="Actual Cost"
              value={formatMaintenanceCurrency(request.actualCost)}
            />
            <DetailField
              label="Requested Date"
              value={formatMaintenanceDate(request.requestedDate)}
            />
            <DetailField
              label="Scheduled Date"
              value={formatMaintenanceDate(request.scheduledDate)}
            />
            <DetailField label="Started Date" value={formatMaintenanceDate(request.startedDate)} />
            <DetailField
              label="Completed Date"
              value={formatMaintenanceDate(request.completedDate)}
            />
            <DetailField label="Created By" value={request.createdBy ?? '—'} />
            <DetailField label="Updated By" value={request.updatedBy ?? '—'} />
            <DetailField
              label="Description"
              value={request.description}
              className="md:col-span-2"
            />
            <DetailField label="Notes" value={request.notes ?? '—'} className="md:col-span-2" />
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <MaintenanceTimeline request={request} />
        </TabsContent>
      </Tabs>

      <AssignTechnicianDialog
        open={showAssign}
        onOpenChange={setShowAssign}
        isLoading={assignMutation.isPending}
        onConfirm={technicianId => assignMutation.mutate(technicianId)}
      />

      {pendingStatus && (
        <ConfirmDialog
          open={!!pendingStatus}
          onOpenChange={open => !open && setPendingStatus(null)}
          title="Change Status"
          description={`Change status to "${pendingStatus}"?`}
          confirmLabel="Confirm"
          isLoading={statusMutation.isPending}
          onConfirm={() => statusMutation.mutate(pendingStatus)}
        />
      )}
    </div>
  )
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
