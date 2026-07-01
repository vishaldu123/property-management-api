import React, { useState } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/shared/components'
import { RoleGate } from '@/shared/components'
import { useAuth, useRoles, useAssignRoleToUser, useRemoveRoleFromUser } from '@/shared/hooks'
import { AdminLayout } from './admin-layout'
import { useMembersList } from '../hooks/use-administration'

export const RoleAssignmentPage: React.FC = () => {
  const { currentOrganization, user } = useAuth()
  const orgId = currentOrganization?.id
  const userRoles = user?.roles?.map(r => r.role?.name).filter(Boolean) as string[]

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState('')

  const { data: members } = useMembersList(orgId, { limit: 100 })
  const { data: rolesData } = useRoles(orgId)
  const assignRole = useAssignRoleToUser()
  const removeRole = useRemoveRoleFromUser()

  const roles = rolesData?.data ?? []

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId || !selectedUserId || !selectedRoleId) return
    await assignRole.mutateAsync({
      userId: selectedUserId,
      organizationId: orgId,
      roleId: selectedRoleId,
    })
    setSelectedRoleId('')
  }

  const handleRemove = async (userId: string, roleId: string) => {
    if (!orgId) return
    await removeRole.mutateAsync({ userId, organizationId: orgId, roleId })
  }

  return (
    <RoleGate
      roles={['organization_owner', 'organization_admin']}
      userRoles={userRoles}
      fallback={
        <AdminLayout title="Role Assignment">
          <p className="text-muted-foreground">You do not have permission to manage roles.</p>
        </AdminLayout>
      }
    >
      <AdminLayout
        title="Role Assignment"
        description="Assign RBAC roles to organization members and review permissions"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assign Role</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleAssign}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
              aria-label="Assign role form"
            >
              <div className="space-y-1">
                <Label htmlFor="assign-user">Member</Label>
                <select
                  id="assign-user"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  required
                  aria-label="Select member"
                >
                  <option value="">Select member</option>
                  {(members?.data ?? []).map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name} ({m.user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="assign-role">Role</Label>
                <select
                  id="assign-role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedRoleId}
                  onChange={e => setSelectedRoleId(e.target.value)}
                  required
                  aria-label="Select role"
                >
                  <option value="">Select role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={assignRole.isPending}>
                Assign Role
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Roles & Permission Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roles.length === 0 && <p className="text-muted-foreground">No roles found.</p>}
            {roles.map(role => (
              <div key={role.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{role.name}</h3>
                  <Badge variant="secondary">{role.permissions?.length ?? 0} permissions</Badge>
                </div>
                {role.description && (
                  <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                )}
                {role.permissions && role.permissions.length > 0 && (
                  <ul
                    className="mt-2 flex flex-wrap gap-1"
                    aria-label={`Permissions for ${role.name}`}
                  >
                    {role.permissions.slice(0, 8).map(p => (
                      <li key={p.id}>
                        <Badge variant="outline" className="text-xs">
                          {p.name}
                        </Badge>
                      </li>
                    ))}
                    {role.permissions.length > 8 && (
                      <li className="text-xs text-muted-foreground">
                        +{role.permissions.length - 8} more
                      </li>
                    )}
                  </ul>
                )}
                {selectedUserId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleRemove(selectedUserId, role.id)}
                    aria-label={`Remove ${role.name} from selected user`}
                  >
                    Remove from selected user
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </AdminLayout>
    </RoleGate>
  )
}
