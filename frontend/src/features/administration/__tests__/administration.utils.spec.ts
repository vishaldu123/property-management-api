import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  loadUserPreferences,
  saveUserPreferences,
  getSystemInfo,
  formatMemberName,
  getStatusBadgeVariant,
  DEFAULT_USER_PREFERENCES,
} from '../utils/administration.utils'
import { USER_PREFERENCES_KEY } from '../constants'

const storage: Record<string, string> = {}

describe('administration.utils', () => {
  beforeEach(() => {
    Object.keys(storage).forEach(key => delete storage[key])
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => storage[key] ?? null)
    vi.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => {
      storage[key] = value
    })
  })

  afterEach(() => {
    vi.mocked(localStorage.clear).mockImplementation(() => {
      Object.keys(storage).forEach(key => delete storage[key])
    })
    localStorage.clear()
  })

  it('loadUserPreferences returns defaults when empty', () => {
    const prefs = loadUserPreferences()
    expect(prefs.theme).toBe(DEFAULT_USER_PREFERENCES.theme)
    expect(prefs.notifications.email).toBe(true)
  })

  it('saveUserPreferences persists to storage', () => {
    saveUserPreferences({ ...DEFAULT_USER_PREFERENCES, theme: 'dark' })
    const raw = localStorage.getItem(USER_PREFERENCES_KEY)
    expect(raw).toBeTruthy()
    const loaded = loadUserPreferences()
    expect(loaded.theme).toBe('dark')
  })

  it('getSystemInfo returns frontend metadata', () => {
    const info = getSystemInfo()
    expect(info.frontendVersion).toBeTruthy()
    expect(info.environment).toBeTruthy()
    expect(info.browser).toBeTruthy()
  })

  it('formatMemberName trims and handles empty', () => {
    expect(formatMemberName('  Jane  ')).toBe('Jane')
    expect(formatMemberName('')).toBe('Unknown User')
  })

  it('getStatusBadgeVariant maps statuses', () => {
    expect(getStatusBadgeVariant('ACTIVE')).toBe('default')
    expect(getStatusBadgeVariant('SUSPENDED')).toBe('destructive')
  })
})
