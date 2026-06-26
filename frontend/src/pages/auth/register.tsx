import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Alert, AlertDescription, TextField } from '@/shared/components'
import { useAuth } from '@/shared/hooks'
import { registerSchema, type RegisterFormData } from '@/utils/validation'
import { isApiError } from '@/shared/services'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      firstName: '',
      lastName: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      setIsLoading(true)
      await register(data.email, data.password, data.firstName, data.lastName)
      navigate('/dashboard')
    } catch (err) {
      if (isApiError(err)) {
        setError(err.response?.data?.message || 'Registration failed')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="firstName"
                control={control}
                label="First Name"
                placeholder="John"
                required
                error={errors.firstName?.message}
              />

              <TextField
                name="lastName"
                control={control}
                label="Last Name"
                placeholder="Doe"
                required
                error={errors.lastName?.message}
              />
            </div>

            <TextField
              name="email"
              control={control}
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
            />

            <TextField
              name="password"
              control={control}
              label="Password"
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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
