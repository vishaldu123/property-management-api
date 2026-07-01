import React from 'react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription } from '@/shared/components'
import { ReportFiltersPanel } from './report-filters'
import { ExportToolbar } from './export-toolbar'
import type { ReportFilters, SavedReportFilter } from '../types'
import type { ExportColumn } from '../utils/export.utils'
import { useReportFilters } from '../hooks/use-report-filters'

interface ReportLayoutProps {
  title: string
  description: string
  reportId: string
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  partialFailures?: string[]
  exportRows: Record<string, unknown>[]
  exportColumns: ExportColumn[]
  showCategory?: boolean
  showStatus?: boolean
  filters: ReportFilters
  onFilterChange: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void
  onResetFilters: () => void
  savedFilters: SavedReportFilter[]
  onSaveFilters: (name: string) => void
  onApplySavedFilter: (id: string) => void
  onDeleteSavedFilter: (id: string) => void
  children: React.ReactNode
}

export const ReportLayout: React.FC<ReportLayoutProps> = ({
  title,
  description,
  reportId,
  isLoading,
  isError,
  errorMessage,
  partialFailures,
  exportRows,
  exportColumns,
  showCategory,
  showStatus,
  filters,
  onFilterChange,
  onResetFilters,
  savedFilters,
  onSaveFilters,
  onApplySavedFilter,
  onDeleteSavedFilter,
  children,
}) => {
  const containerId = `report-${reportId}`

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-1">
            <Link to="/reports" className="hover:underline">
              Reports
            </Link>
            <span aria-hidden="true"> / </span>
            <span>{title}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <ExportToolbar
          reportId={reportId}
          containerId={containerId}
          rows={exportRows}
          columns={exportColumns}
        />
      </header>

      <ReportFiltersPanel
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        savedFilters={savedFilters}
        onSave={onSaveFilters}
        onApplySaved={onApplySavedFilter}
        onDeleteSaved={onDeleteSavedFilter}
        showCategory={showCategory}
        showStatus={showStatus}
      />

      {isError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{errorMessage ?? 'Failed to load report data.'}</AlertDescription>
        </Alert>
      )}

      {partialFailures && partialFailures.length > 0 && (
        <Alert role="status">
          <AlertDescription>
            Some data sources were unavailable: {partialFailures.join(', ')}. Showing partial
            results.
          </AlertDescription>
        </Alert>
      )}

      <div id={containerId} className="space-y-6">
        {children}
        {isLoading && (
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            Loading report data…
          </p>
        )}
      </div>
    </div>
  )
}

export function useReportPageState() {
  const filterState = useReportFilters()
  return {
    filters: filterState.filters,
    layoutProps: {
      filters: filterState.filters,
      onFilterChange: filterState.updateFilter,
      onResetFilters: filterState.resetFilters,
      savedFilters: filterState.savedFilters,
      onSaveFilters: filterState.saveCurrentFilters,
      onApplySavedFilter: filterState.applySavedFilter,
      onDeleteSavedFilter: filterState.deleteSavedFilter,
    },
  }
}
