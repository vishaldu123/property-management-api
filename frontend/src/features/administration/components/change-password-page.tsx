import React, { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/shared/components'
import { AdminLayout } from './admin-layout'
import { useChangePassword } from '../hooks/use-administration'

export const ChangePasswordPage: React.FC = () => {
  const changePassword = useChangePassword()
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (form.newPassword !== form.confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }
    try {
      await changePassword.mutateAsync(form)
      setMessage('Password changed successfully.')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      setMessage('Failed to change password. Check your current password.')
    }
  }

  return (
    <AdminLayout title="Change Password" description="Update your account password">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-w-md"
            aria-label="Change password form"
          >
            <div className="space-y-1">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={form.currentPassword}
                onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={form.newPassword}
                onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
            {message && (
              <p className="text-sm" role="status" aria-live="polite">
                {message}
              </p>
            )}
            <Button type="submit" disabled={changePassword.isPending}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
