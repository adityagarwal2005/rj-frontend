import { apiClient } from './apiClient'
import type { ApiSuccess } from '@/types/api'
import type {
  AuthResponse,
  LoginPayload,
  OtpLoginRequestPayload,
  OtpLoginVerifyPayload,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  ReferralSummary,
  RegisterPayload,
  RegisterResponse,
  ResendOtpPayload,
  UpdateProfilePayload,
  User,
  VerifyEmailPayload,
} from '@/types/auth'

export const authService = {
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const res = await apiClient.post<ApiSuccess<RegisterResponse>>('/auth/register/', payload)
    return res.data.data
  },

  async verifyEmail(payload: VerifyEmailPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/verify-email/', payload)
    return res.data.data
  },

  async resendOtp(payload: ResendOtpPayload): Promise<void> {
    await apiClient.post('/auth/resend-otp/', payload)
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/login/', payload)
    return res.data.data
  },

  async requestOtpLogin(payload: OtpLoginRequestPayload): Promise<void> {
    await apiClient.post('/auth/otp-login/request/', payload)
  },

  async verifyOtpLogin(payload: OtpLoginVerifyPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/otp-login/verify/', payload)
    return res.data.data
  },

  async requestPasswordReset(payload: PasswordResetRequestPayload): Promise<void> {
    await apiClient.post('/auth/password-reset/request/', payload)
  },

  async confirmPasswordReset(payload: PasswordResetConfirmPayload): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm/', payload)
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

  async getReferralSummary(): Promise<ReferralSummary> {
    const res = await apiClient.get<ApiSuccess<ReferralSummary>>('/auth/referrals/')
    return res.data.data
  },
}
