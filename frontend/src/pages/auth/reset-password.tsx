import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Alert, AlertDescription, TextField } from '@/shared/components'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/utils/validation'
import { authService, isApiError } from '@/shared/services'

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const token = searchParams.get('token')

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema) as any,
    defaultValues: {
      password: '',
      passwordConfirm: '',
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid reset token')
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      await authService.resetPassword({
        token,
        password: data.password,
      })
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } })
    } catch (err) {
      if (isApiError(err)) {
        setError(err.response?.data?.message || 'Failed to reset password')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>Invalid or missing reset token</AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full mt-4"
            >
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              name="password"
              control={control}
              label="New Password"
              type="password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
            />

            <TextField
              name="passwordConfirm"
              control={control}
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
              error={errors.passwordConfirm?.message}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Resetting password...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
