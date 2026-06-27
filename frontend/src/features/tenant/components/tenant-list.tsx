import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { tenantService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Loading } from '@/shared/components/ui/loading'
import { EmptyState } from '@/shared/components/ui/empty-state'
import { ErrorState } from '@/shared/components/ui/error-state'
import { usePermissionGate } from '@/shared/hooks'

interface TenantListProps {
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onView?: (id: string) => void
  unitId?: string
}

export const TenantList: React.FC<TenantListProps> = ({
  onEdit,
  onDelete,
  onView,
  unitId,
}) => {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState<string>('')

  const { canPerform } = usePermissionGate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tenants', page, limit, search, status, unitId],
    queryFn: () =>
      tenantService.listTenants({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        unitId: unitId || undefined,
      }),
  })

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Error loading tenants"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        title="No tenants found"
        description="Get started by creating your first tenant"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Status</option>
          <option value="Prospect">Prospect</option>
          <option value="Active">Active</option>
          <option value="Notice">Notice</option>
          <option value="Former">Former</option>
          <option value="Blacklisted">Blacklisted</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map(tenant => (
              <tr key={tenant.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-2">{tenant.firstName} {tenant.lastName}</td>
                <td className="px-4 py-2">{tenant.email}</td>
                <td className="px-4 py-2">{tenant.phone || '-'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    tenant.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : tenant.status === 'Prospect'
                      ? 'bg-blue-100 text-blue-800'
                      : tenant.status === 'Notice'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-1">
                  {onView && (
                    <Button size="sm" variant="ghost" onClick={() => onView(tenant.id)}>
                      View
                    </Button>
                  )}
                  {canPerform('tenant:update') && onEdit && (
                    <Button size="sm" variant="ghost" onClick={() => onEdit(tenant.id)}>
                      Edit
                    </Button>
                  )}
                  {canPerform('tenant:delete') && onDelete && (
                    <Button size="sm" variant="ghost" onClick={() => onDelete(tenant.id)}>
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of {data.total} tenants
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
