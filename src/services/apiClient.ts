import axios, { type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import type { ApiErrorBody } from '@/types/api'
import { ApiError } from './apiError'
import { emitSessionExpired } from './authEvents'

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

/**
 * Authentication rides on httpOnly cookies, not on anything this file can
 * read. Tokens used to sit in localStorage, where a single successful XSS
 * could read and exfiltrate a reusable session; now they are invisible to
 * JavaScript entirely.
 *
 * withCredentials makes the browser attach them. The API is reached
 * same-origin (Vercel proxies /api through to Cloud Run - see vercel.json),
 * which is what lets the cookies be first-party and SameSite=Strict. Pointed
 * straight at the Cloud Run URL they would be third-party cookies: blocked
 * by Safari and being phased out in Chrome.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
})

const AUTH_ENDPOINTS_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh']

let refreshPromise: Promise<void> | null = null

/**
 * Plain axios call (bypasses apiClient's interceptors) to avoid recursive
 * 401 handling. Sends no body: the refresh token is an httpOnly cookie the
 * browser attaches on its own, and the response sets the new cookies.
 *
 * Single-flight on purpose - several requests 401ing at once must trigger
 * one refresh, not a stampede that rotates the token out from under itself.
 */
async function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${env.apiBaseUrl}/auth/refresh/`, {}, { withCredentials: true })
      .then(() => undefined)
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
        await refreshSession()
        // No header to set - the refreshed cookie is already in the jar.
        return apiClient(originalRequest)
      } catch {
        emitSessionExpired()
        return Promise.reject(new ApiError('Your session has expired. Please log in again.', 401))
      }
    }

    return Promise.reject(new ApiError(data?.message ?? 'Something went wrong.', status, data?.errors ?? {}))
  },
)
