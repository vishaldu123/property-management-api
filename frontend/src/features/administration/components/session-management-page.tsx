import React from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/components'
import { useAuth } from '@/shared/hooks'
import { authService } from '@/shared/services'
import { AdminLayout, PlaceholderNotice } from './admin-layout'

export const SessionManagementPage: React.FC = () => {
  const { logout } = useAuth()
  const tokens = authService.getTokens()

  return (
    <AdminLayout title="Session Management" description="View and manage your active sessions">
      <PlaceholderNotice
        title="Session API placeholder"
        message="The backend does not yet expose a multi-session list/revoke API. Your current session is shown below. Use Sign out to end this session."
      />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Current Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium">This device</p>
            <p className="text-xs text-muted-foreground mt-1">
              Active now ·{' '}
              {typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 60) : 'Browser'}…
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Token: {tokens?.accessToken ? `${tokens.accessToken.slice(0, 12)}…` : 'None'}
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => logout()}
            aria-label="Sign out current session"
          >
            Sign Out (Revoke Session)
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
