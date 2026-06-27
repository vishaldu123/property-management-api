import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unitService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { UnitList } from './unit-list'
import { Button } from '@/shared/components/ui/button'
import { usePermissionGate } from '@/shared/hooks'

export const UnitListPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canPerform } = usePermissionGate()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => unitService.deleteUnit(id),
    onSuccess: () => {
      toastService.success('Unit deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
    onError: (error: Error) => {
      toastService.error(`Failed to delete unit: ${error.message}`)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Units</h1>
          <p className="text-muted-foreground mt-2">Manage all units in your organization</p>
        </div>
        {canPerform('unit:create') && (
          <Button onClick={() => navigate('/units/create')}>+ New Unit</Button>
        )}
      </div>

      <UnitList
        onView={id => navigate(`/units/${id}`)}
        onEdit={canPerform('unit:update') ? id => navigate(`/units/${id}/edit`) : undefined}
        onDelete={
          canPerform('unit:delete')
            ? id => {
                if (confirm('Are you sure you want to delete this unit?')) {
                  deleteMutation.mutate(id)
                }
              }
            : undefined
        }
      />
    </div>
  )
}
