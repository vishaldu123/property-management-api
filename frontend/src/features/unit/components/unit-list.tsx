import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { unitService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Loading } from '@/shared/components/ui/loading'
import { EmptyState } from '@/shared/components/ui/empty-state'
import { ErrorState } from '@/shared/components/ui/error-state'
import { usePermissionGate } from '@/shared/hooks'

interface UnitListProps {
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onView?: (id: string) => void
  propertyId?: string
}

export const UnitList: React.FC<UnitListProps> = ({ onEdit, onDelete, onView, propertyId }) => {
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState<string>('')
  const [unitType, setUnitType] = React.useState<string>('')

  const { canPerform } = usePermissionGate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['units', page, limit, search, status, unitType, propertyId],
    queryFn: () =>
      unitService.listUnits({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        unitType: unitType || undefined,
        propertyId: propertyId || undefined,
      }),
  })

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Error loading units"
        message={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState title="No units found" description="Get started by creating your first unit" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search units..."
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
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Reserved">Reserved</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
          value={unitType}
          onChange={e => {
            setUnitType(e.target.value)
            setPage(1)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Types</option>
          <option value="Studio">Studio</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Office">Office</option>
          <option value="Shop">Shop</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Unit Number</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Bedrooms</th>
              <th className="px-4 py-2 text-left">Rent</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map(unit => (
              <tr key={unit.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-2">{unit.unitNumber}</td>
                <td className="px-4 py-2">{unit.unitType}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      unit.status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : unit.status === 'Occupied'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {unit.status}
                  </span>
                </td>
                <td className="px-4 py-2">{unit.bedrooms || '-'}</td>
                <td className="px-4 py-2">${unit.rentAmount || '-'}</td>
                <td className="px-4 py-2 text-right space-x-1">
                  {onView && (
                    <Button size="sm" variant="ghost" onClick={() => onView(unit.id)}>
                      View
                    </Button>
                  )}
                  {canPerform('unit:update') && onEdit && (
                    <Button size="sm" variant="ghost" onClick={() => onEdit(unit.id)}>
                      Edit
                    </Button>
                  )}
                  {canPerform('unit:delete') && onDelete && (
                    <Button size="sm" variant="ghost" onClick={() => onDelete(unit.id)}>
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
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of {data.total}{' '}
          units
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
