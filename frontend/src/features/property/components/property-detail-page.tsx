import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'
import { usePermissionGate } from '@/shared/hooks'

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canPerform } = usePermissionGate()

  const { data: property, isLoading, isError, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => propertyService.deleteProperty(id!),
    onSuccess: () => {
      toastService.success('Property deleted successfully')
      navigate('/properties')
    },
    onError: (error: Error) => {
      toastService.error(`Failed to delete property: ${error.message}`)
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => propertyService.restoreProperty(id!),
    onSuccess: () => {
      toastService.success('Property restored successfully')
      queryClient.invalidateQueries({ queryKey: ['property', id] })
    },
    onError: (error: Error) => {
      toastService.error(`Failed to restore property: ${error.message}`)
    },
  })

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Error loading property"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  if (!property) {
    return (
      <ErrorState
        title="Property not found"
        description="The property you're looking for doesn't exist"
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <p className="text-muted-foreground mt-2">Property Code: {property.code}</p>
        </div>
        <div className="flex gap-2">
          {canPerform('property:update') && (
            <Button onClick={() => navigate(`/properties/${id}/edit`)}>
              Edit
            </Button>
          )}
          {canPerform('property:delete') && !property.deletedAt && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this property?')) {
                  deleteMutation.mutate()
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          )}
          {property.deletedAt && canPerform('property:delete') && (
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

      {property.deletedAt && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">This property has been deleted.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Property Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{property.propertyType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{property.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Units</p>
              <p className="font-medium">{property.totalUnits || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Year Built</p>
              <p className="font-medium">{property.yearBuilt || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Location</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{property.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City/State</p>
              <p className="font-medium">{property.city}, {property.state}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-medium">{property.country}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Postal Code</p>
              <p className="font-medium">{property.postalCode}</p>
            </div>
          </div>
        </div>
      </div>

      {property.description && (
        <div className="mt-6 bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm">{property.description}</p>
        </div>
      )}

      {property.notes && (
        <div className="mt-6 bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm">{property.notes}</p>
        </div>
      )}

      <div className="mt-6 text-xs text-muted-foreground space-y-1">
        <p>Created: {new Date(property.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(property.updatedAt).toLocaleString()}</p>
      </div>

      <Button
        variant="outline"
        className="mt-6"
        onClick={() => navigate('/properties')}
      >
        Back to Properties
      </Button>
    </div>
  )
}
