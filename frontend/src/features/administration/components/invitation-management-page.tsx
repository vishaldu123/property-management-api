import React, { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/shared/components'
import { RoleGate } from '@/shared/components'
import { useAuth } from '@/shared/hooks'
import { AdminLayout, PlaceholderNotice } from './admin-layout'
import { useInviteMember } from '../hooks/use-administration'

export const InvitationManagementPage: React.FC = () => {
  const { currentOrganization, user } = useAuth()
  const orgId = currentOrganization?.id
  const userRoles = user?.roles?.map(r => r.role?.name).filter(Boolean) as string[]
  const inviteMember = useInviteMember(orgId)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER')
  const [lastInviteId, setLastInviteId] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    const result = await inviteMember.mutateAsync({ email: email.trim(), role })
    setLastInviteId(result.id)
    setEmail('')
  }

  return (
    <RoleGate
      roles={['organization_owner', 'organization_admin']}
      userRoles={userRoles}
      fallback={
        <AdminLayout title="Invitation Management">
          <p className="text-muted-foreground">You do not have permission to manage invitations.</p>
        </AdminLayout>
      }
    >
      <AdminLayout
        title="Invitation Management"
        description="Send invitations and manage pending invites"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleInvite}
              className="flex flex-wrap gap-3 items-end"
              aria-label="Send invitation"
            >
              <div className="space-y-1 flex-1 min-w-[200px]">
                <Label htmlFor="invitation-email">Email</Label>
                <Input
                  id="invitation-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="invitation-role">Role</Label>
                <select
                  id="invitation-role"
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={role}
                  onChange={e => setRole(e.target.value as 'MEMBER' | 'ADMIN')}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <Button type="submit" disabled={inviteMember.isPending}>
                Send Invitation
              </Button>
            </form>
            {lastInviteId && (
              <p className="text-sm text-muted-foreground mt-3" role="status">
                Invitation sent successfully.
              </p>
            )}
          </CardContent>
        </Card>

        <PlaceholderNotice
          title="Pending invitations list"
          message="A list-invitations API is not yet exposed by the backend. Use the invitation ID from the invite response to cancel or resend via API. Full invitation management UI will be enabled when the list endpoint is available."
        />
      </AdminLayout>
    </RoleGate>
  )
}
