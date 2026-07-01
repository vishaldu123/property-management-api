import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { maintenanceService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { MaintenanceForm, type MaintenanceFormData } from './maintenance-form'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'
import { useMaintenanceDetail, useInvalidateMaintenance } from '../hooks/use-maintenance'

interface MaintenanceFormPageProps {
  mode: 'create' | 'edit'
}

export const MaintenanceFormPage: React.FC<MaintenanceFormPageProps> = ({ mode }) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { invalidateList, invalidateDetail } = useInvalidateMaintenance()

  const {
    data: request,
    isLoading,
    isError,
    error,
  } = useMaintenanceDetail(mode === 'edit' ? id : undefined)

  const createMutation = useMutation({
    mutationFn: (data: MaintenanceFormData) =>
      maintenanceService.createMaintenance({
        propertyId: data.propertyId,
        unitId: data.unitId || undefined,
        tenantId: data.tenantId || undefined,
        requestNumber: data.requestNumber,
        title: data.title,
        description: data.description,
        category: data.category as never,
        priority: data.priority as never,
        status: (data.status ?? 'Open') as never,
        requestedDate: data.requestedDate,
        scheduledDate: data.scheduledDate,
        estimatedCost: data.estimatedCost?.toString(),
        vendor: data.vendor,
        notes: data.notes,
      }),
    onSuccess: created => {
      toastService.success('Maintenance request created')
      invalidateList()
      navigate(`/maintenance/${created.id}`)
    },
    onError: (e: Error) => toastService.error(`Failed to create: ${e.message}`),
  })

  const updateMutation = useMutation({
    mutationFn: (data: MaintenanceFormData) =>
      maintenanceService.updateMaintenance(id!, {
        title: data.title,
        description: data.description,
        category: data.category as never,
        priority: data.priority as never,
        scheduledDate: data.scheduledDate,
        estimatedCost: data.estimatedCost?.toString(),
        actualCost: data.actualCost?.toString(),
        vendor: data.vendor,
        notes: data.notes,
      }),
    onSuccess: () => {
      toastService.success('Maintenance request updated')
      invalidateDetail(id!)
      invalidateList()
      navigate(`/maintenance/${id}`)
    },
    onError: (e: Error) => toastService.error(`Failed to update: ${e.message}`),
  })

  const handleSubmit = async (data: MaintenanceFormData) => {
    if (mode === 'create') await createMutation.mutateAsync(data)
    else await updateMutation.mutateAsync(data)
  }

  if (mode === 'edit' && isLoading) return <Loading />

  if (mode === 'edit' && isError) {
    return (
      <ErrorState
        title="Error loading request"
        message={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Create Maintenance Request' : 'Edit Maintenance Request'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === 'create'
            ? 'Report a new maintenance issue'
            : 'Update maintenance request details'}
        </p>
      </div>

      <MaintenanceForm
        mode={mode}
        initialData={request}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === 'edit' ? `/maintenance/${id}` : '/maintenance')}
      />
    </div>
  )
}
