import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'
import { usePermissionGate } from '@/shared/hooks'

export const TenantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canPerform } = usePermissionGate()

  const {
    data: tenant,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantService.getTenant(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => tenantService.deleteTenant(id!),
    onSuccess: () => {
      toastService.success('Tenant deleted successfully')
      navigate('/tenants')
    },
    onError: (error: Error) => {
      toastService.error(`Failed to delete tenant: ${error.message}`)
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => tenantService.restoreTenant(id!),
    onSuccess: () => {
      toastService.success('Tenant restored successfully')
      queryClient.invalidateQueries({ queryKey: ['tenant', id] })
    },
    onError: (error: Error) => {
      toastService.error(`Failed to restore tenant: ${error.message}`)
    },
  })

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Error loading tenant"
        message={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  if (!tenant) {
    return (
      <ErrorState title="Tenant not found" message="The tenant you're looking for doesn't exist" />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            {tenant.firstName} {tenant.lastName}
          </h1>
          <p className="text-muted-foreground mt-2">{tenant.email}</p>
        </div>
        <div className="flex gap-2">
          {canPerform('tenant:update') && (
            <Button onClick={() => navigate(`/tenants/${id}/edit`)}>Edit</Button>
          )}
          {canPerform('tenant:delete') && !tenant.deletedAt && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this tenant?')) {
                  deleteMutation.mutate()
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          )}
          {tenant.deletedAt && canPerform('tenant:delete') && (
            <Button
              variant="outline"
              onClick={() => restoreMutation.mutate()}
              disabled={restoreMutation.isPending}
            >
              Restore
            </Button>
          )}
        </div>
      </div>

      {tenant.deletedAt && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">This tenant has been deleted.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{tenant.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {tenant.dateOfBirth ? new Date(tenant.dateOfBirth).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{tenant.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Government ID</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">ID Type</p>
              <p className="font-medium">{tenant.governmentIdType || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID Number</p>
              <p className="font-medium">{tenant.governmentIdNumber || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Employment</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Occupation</p>
              <p className="font-medium">{tenant.occupation || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employer</p>
              <p className="font-medium">{tenant.employer || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Emergency Contact</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{tenant.emergencyContactName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{tenant.emergencyContactPhone || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {tenant.notes && (
        <div className="mt-6 bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm">{tenant.notes}</p>
        </div>
      )}

      <div className="mt-6 text-xs text-muted-foreground space-y-1">
        <p>Created: {new Date(tenant.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(tenant.updatedAt).toLocaleString()}</p>
      </div>

      <Button variant="outline" className="mt-6" onClick={() => navigate('/tenants')}>
        Back to Tenants
      </Button>
    </div>
  )
}
