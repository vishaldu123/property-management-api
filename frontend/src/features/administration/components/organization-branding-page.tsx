import React, { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/shared/components'
import { RoleGate } from '@/shared/components'
import { useAuth, useOrganizationBranding, useUpdateOrganizationBranding } from '@/shared/hooks'
import { AdminLayout } from './admin-layout'

export const OrganizationBrandingPage: React.FC = () => {
  const { currentOrganization, user } = useAuth()
  const orgId = currentOrganization?.id
  const { data: branding, isLoading } = useOrganizationBranding(orgId)
  const updateBranding = useUpdateOrganizationBranding()
  const userRoles = user?.roles?.map(r => r.role?.name).filter(Boolean) as string[]

  const [form, setForm] = useState({
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#0066CC',
    theme: 'light',
  })

  useEffect(() => {
    if (branding) {
      setForm({
        logoUrl: branding.logoUrl ?? '',
        faviconUrl: branding.faviconUrl ?? '',
        primaryColor: branding.primaryColor ?? '#000000',
        secondaryColor: branding.secondaryColor ?? '#FFFFFF',
        accentColor: branding.accentColor ?? '#0066CC',
        theme: branding.theme ?? 'light',
      })
    }
  }, [branding])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    await updateBranding.mutateAsync({
      organizationId: orgId,
      branding: {
        logoUrl: form.logoUrl || null,
        faviconUrl: form.faviconUrl || null,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        theme: form.theme,
      },
    })
  }

  return (
    <RoleGate
      roles={['organization_owner', 'organization_admin']}
      userRoles={userRoles}
      fallback={
        <AdminLayout title="Organization Branding">
          <p className="text-muted-foreground">You do not have permission to manage branding.</p>
        </AdminLayout>
      }
    >
      <AdminLayout
        title="Organization Branding"
        description="Customize logo, colors, and preview your organization identity"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branding Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" aria-label="Branding form">
                <div className="space-y-1">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    value={form.logoUrl}
                    onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    disabled={isLoading}
                    aria-label="Logo upload URL"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a logo image URL (file upload coming soon)
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="favicon-url">Favicon URL (placeholder)</Label>
                  <Input
                    id="favicon-url"
                    value={form.faviconUrl}
                    onChange={e => setForm(f => ({ ...f, faviconUrl: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="primary-color">Primary</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={form.primaryColor}
                      onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                      aria-label="Primary color"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="secondary-color">Secondary</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={form.secondaryColor}
                      onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))}
                      aria-label="Secondary color"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="accent-color">Accent</Label>
                    <Input
                      id="accent-color"
                      type="color"
                      value={form.accentColor}
                      onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                      aria-label="Accent color"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading || updateBranding.isPending}>
                  Save Branding
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card aria-label="Branding preview">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border border-border p-6 space-y-4"
                style={{ borderTopColor: form.primaryColor, borderTopWidth: 4 }}
              >
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Organization logo preview"
                    className="h-12 object-contain"
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded-md flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    LOGO
                  </div>
                )}
                <h3 className="text-lg font-semibold" style={{ color: form.primaryColor }}>
                  {currentOrganization?.name ?? 'Organization'}
                </h3>
                <p className="text-sm text-muted-foreground">Sample dashboard header preview</p>
                <Button type="button" style={{ backgroundColor: form.accentColor }}>
                  Sample Action
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RoleGate>
  )
}
