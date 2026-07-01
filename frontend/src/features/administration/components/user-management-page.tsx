import React, { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/shared/components'
import { RoleGate } from '@/shared/components'
import { useAuth, useRbac } from '@/shared/hooks'
import { AdminLayout } from './admin-layout'
import {
  useMembersList,
  useInviteMember,
  useSuspendMember,
  useReactivateMember,
  useRemoveMember,
} from '../hooks/use-administration'
import { formatMemberName, getStatusBadgeVariant } from '../utils/administration.utils'

export const UserManagementPage: React.FC = () => {
  const { currentOrganization } = useAuth()
  const { canManageMembers, getUserRoleIdentifiers } = useRbac()
  const orgId = currentOrganization?.id
  const userRoles = getUserRoleIdentifiers()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER')

  const { data, isLoading, isError } = useMembersList(orgId, {
    page,
    limit: 10,
    search: search || undefined,
  })
  const inviteMember = useInviteMember(orgId)
  const suspendMember = useSuspendMember(orgId)
  const reactivateMember = useReactivateMember(orgId)
  const removeMember = useRemoveMember(orgId)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    await inviteMember.mutateAsync({ email: inviteEmail.trim(), role: inviteRole })
    setInviteEmail('')
  }

  return (
    <RoleGate
      roles={['organization_owner', 'organization_admin']}
      userRoles={userRoles}
      fallback={
        <AdminLayout title="User Management">
          <p className="text-muted-foreground">You do not have permission to manage users.</p>
        </AdminLayout>
      }
    >
      <AdminLayout
        title="User Management"
        description="View organization members, roles, and membership status"
      >
        {canManageMembers() && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invite User</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleInvite}
                className="flex flex-wrap gap-3 items-end"
                aria-label="Invite user form"
              >
                <div className="space-y-1 flex-1 min-w-[200px]">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as 'MEMBER' | 'ADMIN')}
                    aria-label="Invite role"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <Button type="submit" disabled={inviteMember.isPending}>
                  Invite
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-base">Organization Members</CardTitle>
            <Input
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search members..."
              className="max-w-xs"
              aria-label="Search members"
            />
          </CardHeader>
          <CardContent>
            {isLoading && <p role="status">Loading members…</p>}
            {isError && <p className="text-destructive">Failed to load members.</p>}
            {!isLoading && data?.data.length === 0 && (
              <p className="text-muted-foreground">No members found.</p>
            )}
            {data && data.data.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm" aria-label="Organization members">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium" scope="col">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left font-medium" scope="col">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left font-medium" scope="col">
                        Role
                      </th>
                      <th className="px-4 py-2 text-left font-medium" scope="col">
                        Status
                      </th>
                      {canManageMembers() && (
                        <th className="px-4 py-2 text-right font-medium" scope="col">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map(member => (
                      <tr key={member.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2">{formatMemberName(member.user.name)}</td>
                        <td className="px-4 py-2">{member.user.email}</td>
                        <td className="px-4 py-2">{member.role}</td>
                        <td className="px-4 py-2">
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {member.status}
                          </Badge>
                        </td>
                        {canManageMembers() && (
                          <td className="px-4 py-2 text-right space-x-1">
                            {member.status === 'ACTIVE' && member.role !== 'OWNER' && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => suspendMember.mutate({ memberId: member.id })}
                                aria-label={`Suspend ${member.user.email}`}
                              >
                                Suspend
                              </Button>
                            )}
                            {member.status === 'SUSPENDED' && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => reactivateMember.mutate(member.id)}
                                aria-label={`Reactivate ${member.user.email}`}
                              >
                                Reactivate
                              </Button>
                            )}
                            {member.role !== 'OWNER' && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeMember.mutate(member.id)}
                                aria-label={`Remove ${member.user.email}`}
                              >
                                Remove
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data && data.totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </RoleGate>
  )
}
