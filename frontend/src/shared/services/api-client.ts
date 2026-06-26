import axios, { AxiosInstance, AxiosError } from 'axios'
import { AuthTokens, ApiError } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

let accessToken: string | null = localStorage.getItem('accessToken')
let refreshToken: string | null = localStorage.getItem('refreshToken')
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (reason?: unknown) => void
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

// Request interceptor to add auth token
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor to handle token refresh
client.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If refresh token is not available, reject the request
    if (!refreshToken) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
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
        const response = await axios.post<AuthTokens>(
          `${API_URL}${API_BASE_PATH}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data
        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        client.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        return client(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const apiClient = {
  get: <T>(url: string, config?: Parameters<typeof client.get>[1]) =>
    client.get<T>(url, config),
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
  accessToken = tokens.accessToken
  refreshToken = tokens.refreshToken
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
  client.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`
}

export const clearAuthTokens = () => {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  delete client.defaults.headers.common.Authorization
}

export const isApiError = (error: unknown): error is AxiosError<ApiError> => {
  return axios.isAxiosError(error)
}
