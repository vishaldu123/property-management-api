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

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    setAuthTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    })
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    setAuthTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    })
    return response.data
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {})
    } finally {
      clearAuthTokens()
    }
  },

  refresh: async (): Promise<AuthTokens> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    })
    setAuthTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    })
    return response.data
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

  getTokens: (): AuthTokens | null => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!accessToken || !refreshToken) {
      return null
    }

    return { accessToken, refreshToken }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken')
  },

  clearSession: (): void => {
    clearAuthTokens()
  },
}
