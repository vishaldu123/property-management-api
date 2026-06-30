import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@/shared/components'
import { useAuth, useRbac } from '@/shared/hooks'
import { UserPlusIcon } from '@heroicons/react/24/outline'

export const OrganizationMembersPage: React.FC = () => {
  const { currentOrganization, user } = useAuth()
  const { canManageMembers } = useRbac()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No organization selected</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get current user's organization membership
  const currentUserMembership = user?.organizations.find(
    o => o.organizationId === currentOrganization.id
  )

  // Get current user's role for this organization
  const currentUserOrgRole = user?.roles?.find(
    r => r.organizationId === currentOrganization.id
  )?.role

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-2">
            Manage team members and their roles in {currentOrganization.name}
          </p>
        </div>
        {canManageMembers() && (
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlusIcon className="w-4 h-4" />
            Invite Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Membership</CardTitle>
          <CardDescription>Your current role in this organization</CardDescription>
        </CardHeader>
        <CardContent>
          {currentUserMembership ? (
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentUserOrgRole && <Badge variant="secondary">{currentUserOrgRole.name}</Badge>}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Not a member of this organization
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members Management</CardTitle>
          <CardDescription>Full member management coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Team member management interface will be available in the next update. Currently, you
            can view your own membership information above.
          </p>
        </CardContent>
      </Card>

      {inviteDialogOpen && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Invite New Member</CardTitle>
            <CardDescription>Invite a new team member to join your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Invite feature coming soon</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
