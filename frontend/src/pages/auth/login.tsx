import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  TextField,
} from '@/shared/components'
import { useAuth } from '@/shared/hooks'
import { loginSchema, type LoginFormData } from '@/utils/validation'
import { isApiError } from '@/shared/services'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('[LoginPage] Form submitted with email:', data.email)
      setError(null)
      setIsLoading(true)
      console.log('[LoginPage] Calling login function...')
      await login(data.email, data.password)
      console.log('[LoginPage] Login succeeded, navigating to /dashboard')
      navigate('/dashboard')
    } catch (err) {
      console.error('[LoginPage] Login error:', err)
      if (isApiError(err)) {
        setError(err.response?.data?.message || 'Login failed')
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
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
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

            <TextField
              name="password"
              control={control}
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
            />

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
