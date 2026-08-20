export type UserRole = 'customer' | 'admin'

export interface User {
  id: number
  email: string
  full_name: string
  phone: string
  role: UserRole
  referral_code: string
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthResponse extends AuthTokens {
  user: User
}

export interface RegisterPayload {
  email: string
  full_name: string
  phone?: string
  password: string
  referral_code?: string
}

export interface ReferralCredit {
  id: number
  amount: string
  is_used: boolean
  created_at: string
}

export interface ReferralSummary {
  referral_code: string
  referred_count: number
  successful_referrals: number
  available_credit: string
  credits: ReferralCredit[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  full_name?: string
  phone?: string
}

/** What POST /auth/register/ returns now - no tokens, the account is inactive until verified. */
export interface RegisterResponse {
  email: string
}

export interface VerifyEmailPayload {
  email: string
  code: string
}

export interface ResendOtpPayload {
  email: string
}

export interface OtpLoginRequestPayload {
  email: string
}

export interface OtpLoginVerifyPayload {
  email: string
  code: string
}

export interface PasswordResetRequestPayload {
  email: string
}

export interface PasswordResetConfirmPayload {
  uid: number
  token: string
  new_password: string
}
