import type { UserPreferences } from '../types'
import { USER_PREFERENCES_KEY } from '../constants'

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  density: 'comfortable',
  sidebarCollapsed: false,
  language: 'en',
  notifications: {
    email: true,
    browser: true,
    maintenance: true,
    payments: true,
    leaseExpiration: true,
    weeklySummary: false,
  },
  profile: {
    phone: '',
    avatarUrl: '',
  },
}

export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(USER_PREFERENCES_KEY)
    if (!raw) return { ...DEFAULT_USER_PREFERENCES }
    const parsed = JSON.parse(raw) as Partial<UserPreferences>
    return {
      ...DEFAULT_USER_PREFERENCES,
      ...parsed,
      notifications: {
        ...DEFAULT_USER_PREFERENCES.notifications,
        ...parsed.notifications,
      },
      profile: {
        ...DEFAULT_USER_PREFERENCES.profile,
        ...parsed.profile,
      },
    }
  } catch {
    return { ...DEFAULT_USER_PREFERENCES }
  }
}

export function saveUserPreferences(preferences: UserPreferences): void {
  localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences))
}

export function getSystemInfo(): {
  frontendVersion: string
  environment: string
  buildDate: string
  browser: string
} {
  return {
    frontendVersion: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
    environment: import.meta.env.MODE,
    buildDate: import.meta.env.VITE_BUILD_DATE ?? new Date().toISOString().slice(0, 10),
    browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
  }
}

export function formatMemberName(name: string): string {
  return name.trim() || 'Unknown User'
}

export function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'default'
    case 'SUSPENDED':
      return 'destructive'
    case 'INVITED':
      return 'secondary'
    default:
      return 'outline'
  }
}
