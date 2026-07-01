import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, Label } from '@/shared/components'
import { AdminLayout } from './admin-layout'
import { useUserPreferences } from '../hooks/use-user-preferences'
import { LANGUAGES } from '../constants'
import { cn } from '@/utils/cn'

const selectClass = cn(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
)

export const AppearanceSettingsPage: React.FC = () => {
  const { preferences, updatePreferences } = useUserPreferences()

  return (
    <AdminLayout
      title="Appearance Settings"
      description="Customize theme, density, sidebar, and language"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-lg">
          <div className="space-y-1">
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              className={selectClass}
              value={preferences.theme}
              onChange={e =>
                updatePreferences({ theme: e.target.value as 'light' | 'dark' | 'system' })
              }
              aria-label="Theme selection"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="density">Density</Label>
            <select
              id="density"
              className={selectClass}
              value={preferences.density}
              onChange={e =>
                updatePreferences({ density: e.target.value as 'comfortable' | 'compact' })
              }
              aria-label="UI density"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="sidebar-collapsed"
              type="checkbox"
              checked={preferences.sidebarCollapsed}
              onChange={e => updatePreferences({ sidebarCollapsed: e.target.checked })}
              className="h-4 w-4 rounded border-input"
              aria-label="Collapse sidebar by default"
            />
            <Label htmlFor="sidebar-collapsed">Collapse sidebar by default</Label>
          </div>
          <div className="space-y-1">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              className={selectClass}
              value={preferences.language}
              onChange={e => updatePreferences({ language: e.target.value })}
              aria-label="Language selection"
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
