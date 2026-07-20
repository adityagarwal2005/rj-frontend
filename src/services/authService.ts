import { apiClient } from './apiClient'
import type { ApiSuccess } from '@/types/api'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '@/types/auth'

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/register/', payload)
    return res.data.data
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/login/', payload)
    return res.data.data
  },

  async logout(refresh: string): Promise<void> {
    await apiClient.post('/auth/logout/', { refresh })
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get<ApiSuccess<User>>('/auth/profile/')
    return res.data.data
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await apiClient.patch<ApiSuccess<User>>('/auth/profile/', payload)
    return res.data.data
  },
}
