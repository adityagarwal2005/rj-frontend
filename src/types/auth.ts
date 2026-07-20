export type UserRole = 'customer' | 'admin'

export interface User {
  id: number
  email: string
  full_name: string
  phone: string
  role: UserRole
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
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  full_name?: string
  phone?: string
}
