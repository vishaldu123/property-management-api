import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, Label } from '@/shared/components'
import { AdminLayout } from './admin-layout'
import { useUserPreferences } from '../hooks/use-user-preferences'

const NOTIFICATION_OPTIONS = [
  { key: 'email' as const, label: 'Email notifications' },
  { key: 'browser' as const, label: 'Browser notifications' },
  { key: 'maintenance' as const, label: 'Maintenance alerts' },
  { key: 'payments' as const, label: 'Payment alerts' },
  { key: 'leaseExpiration' as const, label: 'Lease expiration reminders' },
  { key: 'weeklySummary' as const, label: 'Weekly summary digest' },
]

export const NotificationPreferencesPage: React.FC = () => {
  const { preferences, updateNotification } = useUserPreferences()

  return (
    <AdminLayout
      title="Notification Preferences"
      description="Choose how and when you receive notifications"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3" role="group" aria-label="Notification preferences">
          {NOTIFICATION_OPTIONS.map(option => (
            <div key={option.key} className="flex items-center gap-3">
              <input
                id={`notif-${option.key}`}
                type="checkbox"
                checked={preferences.notifications[option.key]}
                onChange={e => updateNotification(option.key, e.target.checked)}
                className="h-4 w-4 rounded border-input"
                aria-label={option.label}
              />
              <Label htmlFor={`notif-${option.key}`}>{option.label}</Label>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">
            Preferences are stored locally until backend notification settings are available.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
