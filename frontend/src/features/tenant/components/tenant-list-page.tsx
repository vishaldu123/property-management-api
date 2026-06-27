import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { TenantList } from './tenant-list'
import { Button } from '@/shared/components/ui/button'
import { usePermissionGate } from '@/shared/hooks'

export const TenantListPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canPerform } = usePermissionGate()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenantService.deleteTenant(id),
    onSuccess: () => {
      toastService.success('Tenant deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: (error: Error) => {
      toastService.error(`Failed to delete tenant: ${error.message}`)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground mt-2">Manage all tenants in your organization</p>
        </div>
        {canPerform('tenant:create') && (
          <Button onClick={() => navigate('/tenants/create')}>+ New Tenant</Button>
        )}
      </div>

      <TenantList
        onView={id => navigate(`/tenants/${id}`)}
        onEdit={canPerform('tenant:update') ? id => navigate(`/tenants/${id}/edit`) : undefined}
        onDelete={
          canPerform('tenant:delete')
            ? id => {
                if (confirm('Are you sure you want to delete this tenant?')) {
                  deleteMutation.mutate(id)
                }
              }
            : undefined
        }
      />
    </div>
  )
}
