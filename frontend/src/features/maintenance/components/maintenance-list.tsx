import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  propertyService,
  tenantService,
  unitService,
  organizationService,
  type MaintenanceRequest,
  type ListMaintenanceParams,
} from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { SkeletonTable } from '@/shared/components'
import { EmptyState } from '@/shared/components/ui/empty-state'
import { ErrorState } from '@/shared/components/ui/error-state'
import { usePermissionGate, useAuth } from '@/shared/hooks'
import { useMaintenanceList, usePrefetchMaintenance } from '../hooks/use-maintenance'
import {
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  OPEN_MAINTENANCE_STATUSES,
} from '../constants'
import {
  filterByVendor,
  filterByTenant,
  formatMaintenanceDate,
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from '../utils/maintenance.utils'

interface MaintenanceListProps {
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onAssign?: (request: MaintenanceRequest) => void
  onBulkAssign?: (ids: string[]) => void
  onBulkClose?: (ids: string[]) => void
  onExport?: (requests: MaintenanceRequest[]) => void
}

export const MaintenanceList: React.FC<MaintenanceListProps> = ({
  onView,
  onEdit,
  onAssign,
  onBulkAssign,
  onBulkClose,
  onExport,
}) => {
  const [searchParams] = useSearchParams()
  const { canPerform } = usePermissionGate()
  const { currentOrganization } = useAuth()
  const prefetchMaintenance = usePrefetchMaintenance()

  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState(searchParams.get('status') ?? '')
  const [priority, setPriority] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [propertyId, setPropertyId] = React.useState('')
  const [unitId, setUnitId] = React.useState('')
  const [tenantId, setTenantId] = React.useState('')
  const [assignedTo, setAssignedTo] = React.useState('')
  const [vendorSearch, setVendorSearch] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [sortBy, setSortBy] = React.useState<ListMaintenanceParams['sortBy']>('createdAt')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (searchParams.get('open') === 'true') setStatus('')
    if (searchParams.get('status')) setStatus(searchParams.get('status') ?? '')
  }, [searchParams])

  const queryParams: ListMaintenanceParams = {
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
    category: category || undefined,
    propertyId: propertyId || undefined,
    unitId: unitId || undefined,
    assignedTo: assignedTo || undefined,
    startDate: startDate ? new Date(`${startDate}T00:00:00.000Z`).toISOString() : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999Z`).toISOString() : undefined,
    sortBy,
    sortOrder,
  }

  const { data, isLoading, isError, error, refetch, isFetching } = useMaintenanceList(queryParams)

  const { data: propertiesData } = useQuery({
    queryKey: ['properties', 'list', 'maintenance-filters'],
    queryFn: () => propertyService.listProperties({ limit: 100 }),
  })

  const { data: unitsData } = useQuery({
    queryKey: ['units', 'list', 'maintenance-filters'],
    queryFn: () => unitService.listUnits({ limit: 100 }),
  })

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants', 'list', 'maintenance-filters'],
    queryFn: () => tenantService.listTenants({ limit: 100 }),
  })

  const { data: membersData } = useQuery({
    queryKey: ['org-members', currentOrganization?.id, 'maintenance-filters'],
    queryFn: () => organizationService.listMembers(currentOrganization!.id, { limit: 100 }),
    enabled: !!currentOrganization?.id,
  })

  const lookupMaps = React.useMemo(
    () => ({
      properties: new Map(propertiesData?.data.map(p => [p.id, p.name]) ?? []),
      units: new Map(unitsData?.data.map(u => [u.id, u.unitNumber]) ?? []),
      tenants: new Map(tenantsData?.data.map(t => [t.id, `${t.firstName} ${t.lastName}`]) ?? []),
      technicians: new Map(
        membersData?.data.map(m => [m.userId, m.user?.name ?? m.user?.email ?? m.userId]) ?? []
      ),
    }),
    [propertiesData, unitsData, tenantsData, membersData]
  )

  let requests = data?.data ?? []
  if (vendorSearch) requests = filterByVendor(requests, vendorSearch)
  if (tenantId) requests = filterByTenant(requests, tenantId)
  if (searchParams.get('open') === 'true' && !status) {
    requests = requests.filter(r => OPEN_MAINTENANCE_STATUSES.includes(r.status))
  }

  const selectedRequests = requests.filter(r => selectedIds.has(r.id))

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const resetPage = () => setPage(1)

  if (isLoading) return <SkeletonTable rows={5} columns={8} />

  if (isError) {
    return (
      <ErrorState
        title="Error loading maintenance requests"
        message={error instanceof Error ? error.message : 'An error occurred'}
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
        role="search"
        aria-label="Maintenance filters"
      >
        <input
          type="text"
          placeholder="Search request #, title..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Search maintenance requests"
        />
        <input
          type="text"
          placeholder="Vendor"
          value={vendorSearch}
          onChange={e => {
            setVendorSearch(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by vendor"
        />
        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          {MAINTENANCE_STATUSES.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={e => {
            setPriority(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          {MAINTENANCE_PRIORITIES.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={e => {
            setCategory(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {MAINTENANCE_CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={assignedTo}
          onChange={e => {
            setAssignedTo(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by technician"
        >
          <option value="">All Technicians</option>
          {membersData?.data.map(m => (
            <option key={m.userId} value={m.userId}>
              {m.user?.name ?? m.user?.email ?? m.userId}
            </option>
          ))}
        </select>
        <select
          value={propertyId}
          onChange={e => {
            setPropertyId(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by property"
        >
          <option value="">All Properties</option>
          {propertiesData?.data.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={unitId}
          onChange={e => {
            setUnitId(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by unit"
        >
          <option value="">All Units</option>
          {unitsData?.data.map(u => (
            <option key={u.id} value={u.id}>
              {u.unitNumber}
            </option>
          ))}
        </select>
        <select
          value={tenantId}
          onChange={e => {
            setTenantId(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by tenant"
        >
          <option value="">All Tenants</option>
          {tenantsData?.data.map(t => (
            <option key={t.id} value={t.id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={e => {
            setStartDate(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => {
            setEndDate(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="End date"
        />
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={e => {
            const [field, order] = e.target.value.split('-') as [
              ListMaintenanceParams['sortBy'],
              'asc' | 'desc',
            ]
            setSortBy(field)
            setSortOrder(order)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Sort maintenance requests"
        >
          <option value="createdAt-desc">Created (newest)</option>
          <option value="createdAt-asc">Created (oldest)</option>
          <option value="scheduledDate-desc">Scheduled (newest)</option>
          <option value="scheduledDate-asc">Scheduled (oldest)</option>
          <option value="priority-desc">Priority (high first)</option>
          <option value="priority-asc">Priority (low first)</option>
          <option value="status-asc">Status (A-Z)</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30" role="toolbar">
          <span className="text-sm self-center">{selectedIds.size} selected</span>
          {canPerform('maintenance:assign') && onBulkAssign && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAssign(Array.from(selectedIds))}
            >
              Assign
            </Button>
          )}
          {canPerform('maintenance:update') && onBulkClose && (
            <Button size="sm" onClick={() => onBulkClose(Array.from(selectedIds))}>
              Close
            </Button>
          )}
          {canPerform('maintenance:view') && onExport && (
            <Button size="sm" variant="outline" onClick={() => onExport(selectedRequests)}>
              Export
            </Button>
          )}
        </div>
      )}

      {isFetching && !isLoading && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Refreshing...
        </p>
      )}

      {!requests.length ? (
        <EmptyState
          title="No maintenance requests found"
          description="Create a new request or adjust your filters"
        />
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full" aria-label="Maintenance requests table">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === requests.length && requests.length > 0}
                      onChange={() => {
                        if (selectedIds.size === requests.length) setSelectedIds(new Set())
                        else setSelectedIds(new Set(requests.map(r => r.id)))
                      }}
                      aria-label="Select all requests"
                    />
                  </th>
                  <th className="px-4 py-2 text-left">Request #</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Property / Unit</th>
                  <th className="px-4 py-2 text-left">Priority</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Technician</th>
                  <th className="px-4 py-2 text-left">Scheduled</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr
                    key={request.id}
                    className="border-t hover:bg-muted/50"
                    onMouseEnter={() => prefetchMaintenance(request.id)}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(request.id)}
                        onChange={() => toggleSelect(request.id)}
                        aria-label={`Select request ${request.requestNumber}`}
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">{request.requestNumber}</td>
                    <td className="px-4 py-2">{request.title}</td>
                    <td className="px-4 py-2 text-sm">
                      {lookupMaps.properties.get(request.propertyId) ?? '—'}
                      <span className="text-muted-foreground">
                        {' '}
                        / {request.unitId ? lookupMaps.units.get(request.unitId) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getPriorityBadgeClass(request.priority)}`}
                      >
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(request.status)}`}
                        aria-label={`Status: ${request.status}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {request.assignedTo
                        ? (lookupMaps.technicians.get(request.assignedTo) ?? '—')
                        : '—'}
                    </td>
                    <td className="px-4 py-2">{formatMaintenanceDate(request.scheduledDate)}</td>
                    <td className="px-4 py-2 text-right space-x-1">
                      {onView && (
                        <Button size="sm" variant="ghost" onClick={() => onView(request.id)}>
                          View
                        </Button>
                      )}
                      {canPerform('maintenance:update') &&
                        onEdit &&
                        !['Completed', 'Cancelled'].includes(request.status) && (
                          <Button size="sm" variant="ghost" onClick={() => onEdit(request.id)}>
                            Edit
                          </Button>
                        )}
                      {canPerform('maintenance:assign') &&
                        onAssign &&
                        request.status === 'Open' && (
                          <Button size="sm" variant="ghost" onClick={() => onAssign(request)}>
                            Assign
                          </Button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of{' '}
                {data.total} requests
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
          )}
        </>
      )}
    </div>
  )
}
