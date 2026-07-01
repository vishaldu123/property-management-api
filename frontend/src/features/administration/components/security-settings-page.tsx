import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components'
import { AdminLayout, PlaceholderNotice } from './admin-layout'

export const SecuritySettingsPage: React.FC = () => (
  <AdminLayout
    title="Security Settings"
    description="Manage password, sessions, MFA, and API access"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to="/admin/security/password"
            className="text-sm text-primary font-medium hover:underline"
          >
            Change Password →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Sessions</CardTitle>
          <CardDescription>View and revoke active sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to="/admin/security/sessions"
            className="text-sm text-primary font-medium hover:underline"
          >
            Manage Sessions →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Multi-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <PlaceholderNotice
            title="MFA placeholder"
            message="Multi-factor authentication setup will be available in a future release."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <PlaceholderNotice
            title="API keys placeholder"
            message="Organization API key management is not yet available from the backend."
          />
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
)
