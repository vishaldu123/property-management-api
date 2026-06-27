import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { PropertyList } from './property-list'
import { Button } from '@/shared/components/ui/button'
import { usePermissionGate } from '@/shared/hooks'

export const PropertyListPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canPerform } = usePermissionGate()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyService.deleteProperty(id),
    onSuccess: () => {
      toastService.success('Property deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
    onError: (error: Error) => {
      toastService.error(`Failed to delete property: ${error.message}`)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-2">Manage all properties in your organization</p>
        </div>
        {canPerform('property:create') && (
          <Button onClick={() => navigate('/properties/create')}>+ New Property</Button>
        )}
      </div>

      <PropertyList
        onView={id => navigate(`/properties/${id}`)}
        onEdit={
          canPerform('property:update') ? id => navigate(`/properties/${id}/edit`) : undefined
        }
        onDelete={
          canPerform('property:delete')
            ? id => {
                if (confirm('Are you sure you want to delete this property?')) {
                  deleteMutation.mutate(id)
                }
              }
            : undefined
        }
      />
    </div>
  )
}
