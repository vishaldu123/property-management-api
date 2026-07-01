import { apiClient, setAuthTokens, clearAuthTokens } from './api-client'
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthTokens,
} from '@/types'

function isValidStoredToken(value: string | null): value is string {
  return !!value && value !== 'undefined' && value !== 'null'
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    const auth = response.data
    setAuthTokens({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    })
    return auth
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const name = `${data.firstName} ${data.lastName}`.trim()
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      name,
      email: data.email,
      password: data.password,
      organizationName: `${name}'s Organization`,
    })
    const auth = response.data
    setAuthTokens({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    })
    return auth
  },

  logout: async (): Promise<void> => {
    const storedRefreshToken = localStorage.getItem('refreshToken')
    try {
      if (isValidStoredToken(storedRefreshToken)) {
        await apiClient.post('/auth/logout', { refreshToken: storedRefreshToken })
      }
    } finally {
      clearAuthTokens()
    }
  },

  refresh: async (): Promise<AuthTokens> => {
    const storedRefreshToken = localStorage.getItem('refreshToken')
    if (!isValidStoredToken(storedRefreshToken)) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<AuthTokens>('/auth/refresh-token', {
      refreshToken: storedRefreshToken,
    })
    const tokens = response.data
    setAuthTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
    return tokens
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data)
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data)
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  changePassword: async (payload: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> => {
    await apiClient.post('/auth/change-password', payload)
  },

  getTokens: (): AuthTokens | null => {
    const accessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (!isValidStoredToken(accessToken) || !isValidStoredToken(storedRefreshToken)) {
      return null
    }

    return { accessToken, refreshToken: storedRefreshToken }
  },

  isAuthenticated: (): boolean => {
    return isValidStoredToken(localStorage.getItem('accessToken'))
  },

  clearSession: (): void => {
    clearAuthTokens()
  },
}
