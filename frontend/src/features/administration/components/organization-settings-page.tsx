import React, { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/shared/components'
import { RoleGate } from '@/shared/components'
import {
  useAuth,
  useOrganization,
  useOrganizationSettings,
  useUpdateOrganization,
  useUpdateOrganizationSettings,
} from '@/shared/hooks'
import { AdminLayout } from './admin-layout'
import { CURRENCIES, LANGUAGES, TIMEZONES } from '../constants'
import { cn } from '@/utils/cn'

const selectClass = cn(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
)

export const OrganizationSettingsPage: React.FC = () => {
  const { currentOrganization, user } = useAuth()
  const orgId = currentOrganization?.id
  const { data: organization, isLoading: orgLoading } = useOrganization(orgId)
  const { data: settings, isLoading: settingsLoading } = useOrganizationSettings(orgId)
  const updateOrg = useUpdateOrganization()
  const updateSettings = useUpdateOrganizationSettings()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    timezone: 'UTC',
    currency: 'USD',
    language: 'en',
  })

  useEffect(() => {
    if (organization || settings) {
      setForm({
        name: organization?.name ?? '',
        email: organization?.email ?? '',
        phone: organization?.phone ?? '',
        website: organization?.website ?? '',
        address: organization?.address ?? '',
        timezone: settings?.timezone ?? organization?.timezone ?? 'UTC',
        currency: settings?.currency ?? organization?.currency ?? 'USD',
        language: settings?.language ?? 'en',
      })
    }
  }, [organization, settings])

  const userRoles = user?.roles?.map(r => r.role?.name).filter(Boolean) as string[]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    await Promise.all([
      updateOrg.mutateAsync({
        organizationId: orgId,
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          website: form.website || undefined,
          address: form.address || undefined,
          timezone: form.timezone,
          currency: form.currency,
        },
      }),
      updateSettings.mutateAsync({
        organizationId: orgId,
        settings: {
          timezone: form.timezone,
          currency: form.currency,
          language: form.language,
        },
      }),
    ])
  }

  const isLoading = orgLoading || settingsLoading

  return (
    <RoleGate
      roles={['organization_owner', 'organization_admin']}
      userRoles={userRoles}
      fallback={
        <AdminLayout title="Organization Settings" description="Access restricted">
          <p className="text-muted-foreground">
            You do not have permission to manage organization settings.
          </p>
        </AdminLayout>
      }
    >
      <AdminLayout
        title="Organization Settings"
        description="Configure organization profile, locale, and regional preferences"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Organization settings form"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="org-email">Email</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="org-phone">Phone</Label>
                  <Input
                    id="org-phone"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="org-website">Website</Label>
                  <Input
                    id="org-website"
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    disabled={isLoading}
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="org-address">Address</Label>
                  <Input
                    id="org-address"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="org-timezone">Time Zone</Label>
                  <select
                    id="org-timezone"
                    className={selectClass}
                    value={form.timezone}
                    onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                    disabled={isLoading}
                    aria-label="Time zone"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="org-currency">Currency</Label>
                  <select
                    id="org-currency"
                    className={selectClass}
                    value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    disabled={isLoading}
                    aria-label="Currency"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="org-language">Language</Label>
                  <select
                    id="org-language"
                    className={selectClass}
                    value={form.language}
                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                    disabled={isLoading}
                    aria-label="Language"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || updateOrg.isPending || updateSettings.isPending}
              >
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </AdminLayout>
    </RoleGate>
  )
}
