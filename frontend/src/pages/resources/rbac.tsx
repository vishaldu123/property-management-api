import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DashboardLayout,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components'
import { useAuth, useRbac } from '@/shared/hooks'
import { CheckIcon } from '@heroicons/react/24/outline'

export const RbacPage: React.FC = () => {
  const { currentOrganization, user } = useAuth()
  const { canManageRbac } = useRbac()

  if (!currentOrganization) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No organization selected</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Get user's roles
  const userRoles = user?.roles || []
  const currentUserRole = userRoles.length > 0 ? userRoles[0].role : null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-2">
            Manage roles and permissions for {currentOrganization.name}
          </p>
        </div>

        <Tabs defaultValue="roles" className="w-full">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Your Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Current Role</CardTitle>
                <CardDescription>Your role in this organization</CardDescription>
              </CardHeader>
              <CardContent>
                {currentUserRole ? (
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{currentUserRole.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {currentUserRole.description}
                        </p>
                      </div>
                      <Badge variant="secondary">{currentUserRole.name}</Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No role assigned</p>
                )}
              </CardContent>
            </Card>

            {canManageRbac() && (
              <Card>
                <CardHeader>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>Manage organization roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Role management interface will be available in the next update.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Permissions</CardTitle>
                <CardDescription>Permissions granted by your role</CardDescription>
              </CardHeader>
              <CardContent>
                {currentUserRole &&
                currentUserRole.permissions &&
                currentUserRole.permissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentUserRole.permissions.map(permission => (
                      <div
                        key={permission.id}
                        className="p-4 border border-border rounded-lg flex items-start gap-3"
                      >
                        <CheckIcon className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{permission.name}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No permissions assigned</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
