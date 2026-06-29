/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { AuthTokens, ApiError } from '@/types'
import type { ApiResponse } from '@/types/api'
import { unwrapApiResponse } from './api-response'

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000'
const API_BASE_PATH = (import.meta.env.VITE_API_BASE_PATH as string) || '/api/v1'

// Initialize refreshToken from localStorage
let refreshToken: string | null = localStorage.getItem('refreshToken') || null
let isRefreshing = false
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let failedQueue: Array<{
  resolve: (_value: string) => void // eslint-disable-line @typescript-eslint/no-unused-vars
  reject: (_reason?: unknown) => void // eslint-disable-line @typescript-eslint/no-unused-vars
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token || '')
    }
  })

  failedQueue = []
}

const client: AxiosInstance = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

function unwrapAxiosResponse<T>(response: AxiosResponse): AxiosResponse<T> {
  response.data = unwrapApiResponse<T>(response.data)
  return response as AxiosResponse<T>
}

// Request interceptor to add auth token
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor: unwrap API envelope and handle token refresh
client.interceptors.response.use(
  response => unwrapAxiosResponse(response),
  async error => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If no refresh token available, redirect to login
      if (!refreshToken || refreshToken === 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return client(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post<ApiResponse<AuthTokens>>(
          `${API_URL}${API_BASE_PATH}/auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        const tokens = unwrapApiResponse<AuthTokens>(response.data)
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokens
        refreshToken = newRefreshToken
        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        client.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        return client(originalRequest)
      } catch (err) {
        processQueue(err, null)
        refreshToken = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const apiClient = {
  get: <T>(url: string, config?: Parameters<typeof client.get>[1]) => client.get<T>(url, config),
  post: <T>(url: string, data?: unknown, config?: Parameters<typeof client.post>[2]) =>
    client.post<T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: Parameters<typeof client.put>[2]) =>
    client.put<T>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: Parameters<typeof client.patch>[2]) =>
    client.patch<T>(url, data, config),
  delete: <T>(url: string, config?: Parameters<typeof client.delete>[1]) =>
    client.delete<T>(url, config),
}

export const setAuthTokens = (tokens: AuthTokens) => {
  refreshToken = tokens.refreshToken
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
  client.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`
}

export const clearAuthTokens = () => {
  refreshToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  delete client.defaults.headers.common.Authorization
}

export const isApiError = (error: unknown): error is AxiosError<ApiError> => {
  return axios.isAxiosError(error)
}
