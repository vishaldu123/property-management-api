import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Input } from '@/shared/components'
import { RoleGate } from '@/shared/components'
import { useRbac } from '@/shared/hooks'
import { AdminLayout, PlaceholderNotice } from './admin-layout'
import type { AuditLogEntry } from '../types'

const PLACEHOLDER_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    user: 'System',
    action: 'AUDIT_PLACEHOLDER',
    entity: 'Organization',
    timestamp: new Date().toISOString(),
  },
]

export const AuditLogPage: React.FC = () => {
  const { getUserRoleIdentifiers } = useRbac()
  const userRoles = getUserRoleIdentifiers()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return PLACEHOLDER_LOGS
    const q = search.toLowerCase()
    return PLACEHOLDER_LOGS.filter(
      log =>
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <RoleGate
      roles={['organization_owner', 'organization_admin']}
      userRoles={userRoles}
      fallback={
        <AdminLayout title="Audit Log">
          <p className="text-muted-foreground">You do not have permission to view audit logs.</p>
        </AdminLayout>
      }
    >
      <AdminLayout title="Audit Log Viewer" description="Organization activity and change history">
        <PlaceholderNotice
          title="Audit log API unavailable"
          message="No organization audit log API is exposed yet. The table below demonstrates the UI with placeholder data."
        />

        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-base">Audit Events</CardTitle>
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="max-w-xs"
              aria-label="Search audit logs"
            />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm" aria-label="Audit log table">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium" scope="col">
                      User
                    </th>
                    <th className="px-4 py-2 text-left font-medium" scope="col">
                      Action
                    </th>
                    <th className="px-4 py-2 text-left font-medium" scope="col">
                      Entity
                    </th>
                    <th className="px-4 py-2 text-left font-medium" scope="col">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2">{log.user}</td>
                      <td className="px-4 py-2">{log.action}</td>
                      <td className="px-4 py-2">{log.entity}</td>
                      <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Showing placeholder audit data</p>
          </CardContent>
        </Card>
      </AdminLayout>
    </RoleGate>
  )
}
