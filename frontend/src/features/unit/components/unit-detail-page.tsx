import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { unitService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'
import { usePermissionGate } from '@/shared/hooks'

export const UnitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canPerform } = usePermissionGate()

  const { data: unit, isLoading, isError, error } = useQuery({
    queryKey: ['unit', id],
    queryFn: () => unitService.getUnit(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => unitService.deleteUnit(id!),
    onSuccess: () => {
      toastService.success('Unit deleted successfully')
      navigate('/units')
    },
    onError: (error: Error) => {
      toastService.error(`Failed to delete unit: ${error.message}`)
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => unitService.restoreUnit(id!),
    onSuccess: () => {
      toastService.success('Unit restored successfully')
      queryClient.invalidateQueries({ queryKey: ['unit', id] })
    },
    onError: (error: Error) => {
      toastService.error(`Failed to restore unit: ${error.message}`)
    },
  })

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Error loading unit"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  if (!unit) {
    return (
      <ErrorState
        title="Unit not found"
        description="The unit you're looking for doesn't exist"
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{unit.name || `Unit ${unit.unitNumber}`}</h1>
          <p className="text-muted-foreground mt-2">Unit Number: {unit.unitNumber}</p>
        </div>
        <div className="flex gap-2">
          {canPerform('unit:update') && (
            <Button onClick={() => navigate(`/units/${id}/edit`)}>
              Edit
            </Button>
          )}
          {canPerform('unit:delete') && !unit.deletedAt && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this unit?')) {
                  deleteMutation.mutate()
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          )}
          {unit.deletedAt && canPerform('unit:delete') && (
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

      {unit.deletedAt && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">This unit has been deleted.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Unit Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{unit.unitType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{unit.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Floor</p>
              <p className="font-medium">{unit.floor || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Block</p>
              <p className="font-medium">{unit.block || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Specifications</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Bedrooms</p>
              <p className="font-medium">{unit.bedrooms || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bathrooms</p>
              <p className="font-medium">{unit.bathrooms || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Area</p>
              <p className="font-medium">{unit.area ? `${unit.area} ${unit.areaUnit}` : '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Financial</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
              <p className="font-medium">${unit.rentAmount || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Security Deposit</p>
              <p className="font-medium">${unit.securityDeposit || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Availability Date</p>
              <p className="font-medium">
                {unit.availabilityDate ? new Date(unit.availabilityDate).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {unit.notes && (
        <div className="mt-6 bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm">{unit.notes}</p>
        </div>
      )}

      <div className="mt-6 text-xs text-muted-foreground space-y-1">
        <p>Created: {new Date(unit.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(unit.updatedAt).toLocaleString()}</p>
      </div>

      <Button
        variant="outline"
        className="mt-6"
        onClick={() => navigate('/units')}
      >
        Back to Units
      </Button>
    </div>
  )
}
