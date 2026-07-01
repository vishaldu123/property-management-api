import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { invalidateDashboard } from '@/features/dashboard'
import { TenantForm, TenantFormData } from './tenant-form'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'

interface TenantFormPageProps {
  mode: 'create' | 'edit'
}

export const TenantFormPage: React.FC<TenantFormPageProps> = ({ mode }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()

  const {
    data: tenant,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantService.getTenant(id!),
    enabled: mode === 'edit' && !!id,
  })

  const createMutation = useMutation({
    mutationFn: (data: TenantFormData) => tenantService.createTenant(data),
    onSuccess: () => {
      void invalidateDashboard(queryClient)
      toastService.success('Tenant created successfully')
      navigate('/tenants')
    },
    onError: (error: Error) => {
      toastService.error(`Failed to create tenant: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: TenantFormData) => tenantService.updateTenant(id!, data),
    onSuccess: () => {
      void invalidateDashboard(queryClient)
      toastService.success('Tenant updated successfully')
      navigate(`/tenants/${id}`)
    },
    onError: (error: Error) => {
      toastService.error(`Failed to update tenant: ${error.message}`)
    },
  })

  const onSubmit = async (data: TenantFormData) => {
    if (mode === 'create') {
      await createMutation.mutateAsync(data)
    } else {
      await updateMutation.mutateAsync(data)
    }
  }

  if (mode === 'edit' && isLoading) return <Loading />

  if (mode === 'edit' && isError) {
    return (
      <ErrorState
        title="Error loading tenant"
        message={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Create Tenant' : 'Edit Tenant'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === 'create' ? 'Add a new tenant to your organization' : 'Update tenant details'}
        </p>
      </div>

      <TenantForm
        onSubmit={onSubmit}
        onCancel={() => navigate('/tenants')}
        defaultValues={
          tenant
            ? {
                firstName: tenant.firstName,
                lastName: tenant.lastName,
                email: tenant.email,
                phone: tenant.phone,
                dateOfBirth: tenant.dateOfBirth,
                governmentIdType: tenant.governmentIdType,
                governmentIdNumber: tenant.governmentIdNumber,
                emergencyContactName: tenant.emergencyContactName,
                emergencyContactPhone: tenant.emergencyContactPhone,
                occupation: tenant.occupation,
                employer: tenant.employer,
                unitId: tenant.unitId,
                status: tenant.status,
                notes: tenant.notes,
              }
            : undefined
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitLabel={mode === 'create' ? 'Create Tenant' : 'Update Tenant'}
      />
    </div>
  )
}
