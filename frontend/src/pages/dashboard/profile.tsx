import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, DashboardLayout } from '@/shared/components'
import { useAuth } from '@/shared/hooks'

export const ProfilePage: React.FC = () => {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div>
              <p className="text-sm text-muted-foreground">Display Name</p>
              <p className="text-sm font-medium">{user?.displayName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Roles</CardTitle>
            <CardDescription>Roles assigned to you across organizations</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.roles && user.roles.length > 0 ? (
              <ul className="space-y-2">
                {user.roles.map(role => (
                  <li key={role.id} className="text-sm">
                    <span className="font-medium">{role.role?.name}</span>
                    <p className="text-xs text-muted-foreground">{role.role?.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Organizations</CardTitle>
            <CardDescription>Organizations you are a member of</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.organizations && user.organizations.length > 0 ? (
              <ul className="space-y-2">
                {user.organizations.map(org => (
                  <li key={org.id} className="text-sm">
                    <span className="font-medium">{org.organization?.name}</span>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(org.joinedAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No organizations yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
