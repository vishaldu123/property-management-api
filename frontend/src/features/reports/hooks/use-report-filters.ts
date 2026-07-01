import { useCallback, useMemo, useState } from 'react'
import type { ReportFilters, SavedReportFilter } from '../types'
import { EMPTY_REPORT_FILTERS, SAVED_FILTERS_STORAGE_KEY } from '../constants'

function loadSavedFilters(): SavedReportFilter[] {
  try {
    const raw = localStorage.getItem(SAVED_FILTERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedReportFilter[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistSavedFilters(filters: SavedReportFilter[]): void {
  localStorage.setItem(SAVED_FILTERS_STORAGE_KEY, JSON.stringify(filters))
}

export function useReportFilters(initial?: ReportFilters) {
  const [filters, setFilters] = useState<ReportFilters>(initial ?? EMPTY_REPORT_FILTERS)
  const [savedFilters, setSavedFilters] = useState<SavedReportFilter[]>(loadSavedFilters)

  const updateFilter = useCallback(
    <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => {
      setFilters(prev => {
        const next = { ...prev, [key]: value || undefined }
        if (!value) delete next[key]
        return next
      })
    },
    []
  )

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_REPORT_FILTERS)
  }, [])

  const saveCurrentFilters = useCallback((name: string) => {
    setFilters(currentFilters => {
      const entry: SavedReportFilter = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `filter-${Date.now()}`,
        name,
        filters: { ...currentFilters },
        createdAt: new Date().toISOString(),
      }
      setSavedFilters(prev => {
        const next = [...prev, entry]
        persistSavedFilters(next)
        return next
      })
      return currentFilters
    })
  }, [])

  const applySavedFilter = useCallback((id: string) => {
    const entry = loadSavedFilters().find(f => f.id === id)
    if (entry) setFilters({ ...entry.filters })
  }, [])

  const deleteSavedFilter = useCallback(
    (id: string) => {
      const next = savedFilters.filter(f => f.id !== id)
      setSavedFilters(next)
      persistSavedFilters(next)
    },
    [savedFilters]
  )

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(v => v !== undefined && v !== '').length,
    [filters]
  )

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    savedFilters,
    saveCurrentFilters,
    applySavedFilter,
    deleteSavedFilter,
    activeFilterCount,
  }
}
