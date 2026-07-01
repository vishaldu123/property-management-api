import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReportFilters } from '../hooks/use-report-filters'
import { SAVED_FILTERS_STORAGE_KEY } from '../constants'

const storage: Record<string, string> = {}

describe('useReportFilters', () => {
  beforeEach(() => {
    Object.keys(storage).forEach(key => delete storage[key])
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => storage[key] ?? null)
    vi.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => {
      storage[key] = value
    })
    vi.mocked(localStorage.clear).mockImplementation(() => {
      Object.keys(storage).forEach(key => delete storage[key])
    })
  })

  afterEach(() => {
    vi.mocked(localStorage.clear).mockImplementation(() => {
      Object.keys(storage).forEach(key => delete storage[key])
    })
    localStorage.clear()
  })

  it('updates and resets filters', () => {
    const { result } = renderHook(() => useReportFilters())

    act(() => {
      result.current.updateFilter('propertyId', 'prop-1')
      result.current.updateFilter('search', 'test')
    })

    expect(result.current.filters.propertyId).toBe('prop-1')
    expect(result.current.filters.search).toBe('test')
    expect(result.current.activeFilterCount).toBe(2)

    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.filters).toEqual({})
    expect(result.current.activeFilterCount).toBe(0)
  })

  it('saves and applies filter presets to localStorage', () => {
    const { result } = renderHook(() => useReportFilters())

    act(() => {
      result.current.updateFilter('status', 'Active')
      result.current.saveCurrentFilters('Active only')
    })

    expect(result.current.savedFilters).toHaveLength(1)
    expect(result.current.savedFilters[0].name).toBe('Active only')

    const stored = JSON.parse(localStorage.getItem(SAVED_FILTERS_STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)

    act(() => {
      result.current.resetFilters()
    })

    act(() => {
      result.current.applySavedFilter(result.current.savedFilters[0].id)
    })

    expect(result.current.filters.status).toBe('Active')
  })
})
