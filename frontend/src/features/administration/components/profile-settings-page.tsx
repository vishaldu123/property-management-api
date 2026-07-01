import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/shared/components'
import { useAuth } from '@/shared/hooks'
import { AdminLayout } from './admin-layout'
import { useUserPreferences } from '../hooks/use-user-preferences'

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth()
  const { preferences, updatePreferences } = useUserPreferences()

  return (
    <AdminLayout
      title="Profile Settings"
      description="Manage your personal information and preferences"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold"
                aria-label="Avatar"
              >
                {preferences.profile.avatarUrl ? (
                  <img
                    src={preferences.profile.avatarUrl}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  (user?.firstName?.charAt(0) ?? 'U')
                )}
              </div>
              <div className="space-y-1 flex-1">
                <Label htmlFor="avatar-url">Avatar URL</Label>
                <Input
                  id="avatar-url"
                  value={preferences.profile.avatarUrl}
                  onChange={e =>
                    updatePreferences({
                      profile: { ...preferences.profile, avatarUrl: e.target.value },
                    })
                  }
                  placeholder="https://"
                  aria-label="Avatar URL"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="text-sm font-medium">{user?.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Name</p>
                <p className="text-sm font-medium">{user?.lastName}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={preferences.profile.phone}
                onChange={e =>
                  updatePreferences({ profile: { ...preferences.profile, phone: e.target.value } })
                }
                aria-label="Phone number"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.roles && user.roles.length > 0 ? (
              <ul className="space-y-2">
                {user.roles.map(role => (
                  <li key={role.id} className="text-sm border border-border rounded-md p-3">
                    <span className="font-medium">{role.role?.name}</span>
                    {role.role?.description && (
                      <p className="text-xs text-muted-foreground mt-1">{role.role.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
