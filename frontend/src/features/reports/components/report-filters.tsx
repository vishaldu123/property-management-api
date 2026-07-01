import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Input, Label } from '@/shared/components'
import { propertyService, unitService, tenantService, leaseService } from '@/shared/services'
import { useAuth } from '@/shared/hooks'
import { cn } from '@/utils/cn'
import type { ReportFilters } from '../types'

interface ReportFiltersPanelProps {
  filters: ReportFilters
  onFilterChange: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void
  onReset: () => void
  savedFilters: Array<{ id: string; name: string }>
  onSave: (name: string) => void
  onApplySaved: (id: string) => void
  onDeleteSaved: (id: string) => void
  showCategory?: boolean
  showStatus?: boolean
}

const selectClassName = cn(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
)

export const ReportFiltersPanel: React.FC<ReportFiltersPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  savedFilters,
  onSave,
  onApplySaved,
  onDeleteSaved,
  showCategory = false,
  showStatus = false,
}) => {
  const { currentOrganization } = useAuth()
  const [saveName, setSaveName] = useState('')

  const { data: properties } = useQuery({
    queryKey: ['reports-filter', 'properties'],
    queryFn: () => propertyService.listProperties({ limit: 100 }),
    staleTime: 120_000,
  })

  const { data: units } = useQuery({
    queryKey: ['reports-filter', 'units', filters.propertyId],
    queryFn: () => unitService.listUnits({ limit: 100, propertyId: filters.propertyId }),
    enabled: !!filters.propertyId,
    staleTime: 120_000,
  })

  const { data: tenants } = useQuery({
    queryKey: ['reports-filter', 'tenants'],
    queryFn: () => tenantService.listTenants({ limit: 100 }),
    staleTime: 120_000,
  })

  const { data: leases } = useQuery({
    queryKey: ['reports-filter', 'leases', filters.propertyId],
    queryFn: () => leaseService.listLeases({ limit: 100, propertyId: filters.propertyId }),
    staleTime: 120_000,
  })

  useEffect(() => {
    if (filters.propertyId && filters.unitId && units) {
      const unitBelongs = units.data.some(u => u.id === filters.unitId)
      if (!unitBelongs) onFilterChange('unitId', undefined)
    }
  }, [filters.propertyId, filters.unitId, units, onFilterChange])

  return (
    <section
      className="rounded-lg border border-border bg-card p-4 space-y-4"
      aria-label="Report filters"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Filters</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label="Reset filters"
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label htmlFor="filter-org">Organization</Label>
          <Input
            id="filter-org"
            value={currentOrganization?.name ?? '—'}
            disabled
            aria-readonly="true"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-property">Property</Label>
          <select
            id="filter-property"
            className={selectClassName}
            value={filters.propertyId ?? ''}
            onChange={e => onFilterChange('propertyId', e.target.value || undefined)}
            aria-label="Filter by property"
          >
            <option value="">All properties</option>
            {properties?.data.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-unit">Unit</Label>
          <select
            id="filter-unit"
            className={selectClassName}
            value={filters.unitId ?? ''}
            onChange={e => onFilterChange('unitId', e.target.value || undefined)}
            disabled={!filters.propertyId}
            aria-label="Filter by unit"
          >
            <option value="">All units</option>
            {(units?.data ?? []).map(u => (
              <option key={u.id} value={u.id}>
                {u.unitNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-tenant">Tenant</Label>
          <select
            id="filter-tenant"
            className={selectClassName}
            value={filters.tenantId ?? ''}
            onChange={e => onFilterChange('tenantId', e.target.value || undefined)}
            aria-label="Filter by tenant"
          >
            <option value="">All tenants</option>
            {tenants?.data.map(t => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-lease">Lease</Label>
          <select
            id="filter-lease"
            className={selectClassName}
            value={filters.leaseId ?? ''}
            onChange={e => onFilterChange('leaseId', e.target.value || undefined)}
            aria-label="Filter by lease"
          >
            <option value="">All leases</option>
            {(leases?.data ?? []).map(l => (
              <option key={l.id} value={l.id}>
                {l.leaseNumber ?? l.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-start">Start date</Label>
          <Input
            id="filter-start"
            type="date"
            value={filters.startDate ?? ''}
            onChange={e => onFilterChange('startDate', e.target.value || undefined)}
            aria-label="Filter start date"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-end">End date</Label>
          <Input
            id="filter-end"
            type="date"
            value={filters.endDate ?? ''}
            onChange={e => onFilterChange('endDate', e.target.value || undefined)}
            aria-label="Filter end date"
          />
        </div>

        {showStatus && (
          <div className="space-y-1">
            <Label htmlFor="filter-status">Status</Label>
            <Input
              id="filter-status"
              value={filters.status ?? ''}
              onChange={e => onFilterChange('status', e.target.value || undefined)}
              placeholder="e.g. Active, Paid"
              aria-label="Filter by status"
            />
          </div>
        )}

        {showCategory && (
          <div className="space-y-1">
            <Label htmlFor="filter-category">Category</Label>
            <Input
              id="filter-category"
              value={filters.category ?? ''}
              onChange={e => onFilterChange('category', e.target.value || undefined)}
              placeholder="e.g. HVAC"
              aria-label="Filter by category"
            />
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="filter-search">Search</Label>
          <Input
            id="filter-search"
            value={filters.search ?? ''}
            onChange={e => onFilterChange('search', e.target.value || undefined)}
            placeholder="Search..."
            aria-label="Search filter"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <Label htmlFor="save-filter-name">Save current filters</Label>
          <Input
            id="save-filter-name"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="Filter preset name"
            aria-label="Saved filter name"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!saveName.trim()}
          onClick={() => {
            onSave(saveName.trim())
            setSaveName('')
          }}
          aria-label="Save filter preset"
        >
          Save
        </Button>
      </div>

      {savedFilters.length > 0 && (
        <div className="space-y-2" role="list" aria-label="Saved filter presets">
          <p className="text-xs font-medium text-muted-foreground">Saved filters</p>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(preset => (
              <div key={preset.id} className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onApplySaved(preset.id)}
                  aria-label={`Apply saved filter ${preset.name}`}
                >
                  {preset.name}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSaved(preset.id)}
                  aria-label={`Delete saved filter ${preset.name}`}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
