import axios, { type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import type { ApiErrorBody, ApiSuccess } from '@/types/api'
import type { AuthTokens } from '@/types/auth'
import { ApiError } from './apiError'
import { emitSessionExpired } from './authEvents'
import { tokenStorage } from './tokenStorage'

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
})

apiClient.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess()
  if (access) {
    config.headers.set('Authorization', `Bearer ${access}`)
  }
  return config
})

const AUTH_ENDPOINTS_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh']

let refreshPromise: Promise<string> | null = null

/** Plain axios call (bypasses apiClient's interceptors) to avoid recursive 401 handling. */
async function refreshAccessToken(): Promise<string> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) throw new Error('No refresh token available')

  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiSuccess<AuthTokens>>(`${env.apiBaseUrl}/auth/refresh/`, { refresh })
      .then((response) => {
        tokenStorage.setTokens(response.data.data)
        return response.data.data.access
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError<ApiErrorBody>(error)) {
      return Promise.reject(new ApiError('Something went wrong.', 0))
    }

    if (!error.response) {
      return Promise.reject(new ApiError('Network error. Please check your connection.', 0))
    }

    const { status, data } = error.response
    const originalRequest = error.config as RetriableConfig | undefined
    const isAuthEndpoint = AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) =>
      originalRequest?.url?.includes(path),
    )

    if (status === 401 && !isAuthEndpoint && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const newAccess = await refreshAccessToken()
        originalRequest.headers.set('Authorization', `Bearer ${newAccess}`)
        return apiClient(originalRequest)
      } catch {
        tokenStorage.clear()
        emitSessionExpired()
        return Promise.reject(new ApiError('Your session has expired. Please log in again.', 401))
      }
    }

    return Promise.reject(new ApiError(data?.message ?? 'Something went wrong.', status, data?.errors ?? {}))
  },
)
