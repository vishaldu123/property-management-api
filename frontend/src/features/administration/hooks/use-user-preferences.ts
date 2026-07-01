import { useCallback, useEffect, useState } from 'react'
import type { UserPreferences } from '../types'
import { loadUserPreferences, saveUserPreferences } from '../utils/administration.utils'
import { useTheme } from '@/shared/hooks'

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(loadUserPreferences)
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(preferences.theme)
  }, [preferences.theme, setTheme])

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const next: UserPreferences = {
        ...prev,
        ...patch,
        notifications: patch.notifications
          ? { ...prev.notifications, ...patch.notifications }
          : prev.notifications,
        profile: patch.profile ? { ...prev.profile, ...patch.profile } : prev.profile,
      }
      saveUserPreferences(next)
      return next
    })
  }, [])

  const updateNotification = useCallback(
    (key: keyof UserPreferences['notifications'], value: boolean) => {
      updatePreferences({
        notifications: { ...preferences.notifications, [key]: value },
      })
    },
    [preferences.notifications, updatePreferences]
  )

  return { preferences, updatePreferences, updateNotification }
}
