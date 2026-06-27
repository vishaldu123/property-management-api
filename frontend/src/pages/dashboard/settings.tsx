import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DashboardLayout,
  Button,
} from '@/shared/components'

export const SettingsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Account settings will be available here. You&apos;ll be able to:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Change your password</li>
              <li>Enable two-factor authentication</li>
              <li>Manage email notifications</li>
              <li>View your login history</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>Control your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Privacy and security settings will be available here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Notification preferences will be available here. You&apos;ll be able to:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Enable/disable email notifications</li>
              <li>Set digest frequency</li>
              <li>Choose notification types</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Manage your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Data management options will be available here.
            </p>
            <div className="pt-4 space-y-2">
              <Button variant="outline">Download Your Data</Button>
              <Button variant="outline">Request Data Deletion</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
