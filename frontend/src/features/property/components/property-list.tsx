import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { propertyService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Loading } from '@/shared/components/ui/loading'
import { EmptyState } from '@/shared/components/ui/empty-state'
import { ErrorState } from '@/shared/components/ui/error-state'
import { usePermissionGate } from '@/shared/hooks'

interface PropertyListProps {
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onRestore?: (id: string) => void
  onView?: (id: string) => void
}

export const PropertyList: React.FC<PropertyListProps> = ({ onEdit, onDelete, onView }) => {
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState<string>('')
  const [propertyType, setPropertyType] = React.useState<string>('')

  const { canPerform } = usePermissionGate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['properties', page, limit, search, status, propertyType],
    queryFn: () =>
      propertyService.listProperties({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        propertyType: propertyType || undefined,
      }),
  })

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Error loading properties"
        message={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        title="No properties found"
        description="Get started by creating your first property"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          value={propertyType}
          onChange={e => {
            setPropertyType(e.target.value)
            setPage(1)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Commercial">Commercial</option>
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">City</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Units</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map(property => (
              <tr key={property.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-2">{property.name}</td>
                <td className="px-4 py-2">{property.code}</td>
                <td className="px-4 py-2">{property.propertyType}</td>
                <td className="px-4 py-2">{property.city}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      property.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : property.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {property.status}
                  </span>
                </td>
                <td className="px-4 py-2">{property.totalUnits || '-'}</td>
                <td className="px-4 py-2 text-right space-x-1">
                  {onView && (
                    <Button size="sm" variant="ghost" onClick={() => onView(property.id)}>
                      View
                    </Button>
                  )}
                  {canPerform('property:update') && onEdit && (
                    <Button size="sm" variant="ghost" onClick={() => onEdit(property.id)}>
                      Edit
                    </Button>
                  )}
                  {canPerform('property:delete') && onDelete && (
                    <Button size="sm" variant="ghost" onClick={() => onDelete(property.id)}>
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of {data.total}{' '}
          properties
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
