import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Alert, AlertDescription, TextField } from '@/shared/components'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/utils/validation'
import { authService, isApiError } from '@/shared/services'

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null)
      setSuccess(false)
      setIsLoading(true)
      await authService.forgotPassword(data)
      setSuccess(true)
    } catch (err) {
      if (isApiError(err)) {
        setError(err.response?.data?.message || 'Failed to send reset link')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                We've sent a password reset link to your email. Please check your inbox and follow the instructions.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Back to Sign In
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
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              name="email"
              control={control}
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending link...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
