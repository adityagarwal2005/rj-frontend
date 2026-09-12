import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { authService } from '@/services/authService'
import { onSessionExpired } from '@/services/authEvents'
import type {
  AuthResponse,
  LoginPayload,
  OtpLoginVerifyPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
  VerifyEmailPayload,
} from '@/types/auth'
import { useToast } from './ToastContext'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (payload: LoginPayload) => Promise<void>
  /** No auto-login anymore - the account stays inactive until verifyEmail succeeds. */
  register: (payload: RegisterPayload) => Promise<{ email: string }>
  verifyEmail: (payload: VerifyEmailPayload) => Promise<void>
  loginWithOtp: (payload: OtpLoginVerifyPayload) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const { showToast } = useToast()

  // Read inside the session-expired listener, which is registered once and
  // would otherwise see a stale `user`.
  const userRef = useRef<User | null>(null)
  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    onSessionExpired(() => {
      // Only someone who was actually signed in can have a session expire.
      // Every first-time visitor's startup profile check also ends in a
      // failed refresh, and this used to greet all of them - on every page
      // load - with "Your session has expired. Please log in again."
      if (!userRef.current) return
      setUser(null)
      showToast('Your session has expired. Please log in again.', 'info')
    })
  }, [showToast])

  useEffect(() => {
    async function bootstrap() {
      // The session now lives in httpOnly cookies, which JavaScript cannot
      // read - so there is nothing to check locally. Ask the server who we
      // are and treat a rejection as simply "not logged in"; the browser
      // sends the cookie automatically if there is one.
      try {
        const profile = await authService.getProfile()
        setUser(profile)
      } catch {
        setUser(null)
      } finally {
        setIsInitializing(false)
      }
    }
    void bootstrap()
  }, [])

  function completeLogin({ user: loggedInUser }: AuthResponse) {
    // No token handling here any more - the server set httpOnly cookies on
    // the login response and the browser will attach them from now on.
    setUser(loggedInUser)
  }

  const login = useCallback(async (payload: LoginPayload) => {
    completeLogin(await authService.login(payload))
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    return authService.register(payload)
  }, [])

  const verifyEmail = useCallback(async (payload: VerifyEmailPayload) => {
    completeLogin(await authService.verifyEmail(payload))
  }, [])

  const loginWithOtp = useCallback(async (payload: OtpLoginVerifyPayload) => {
    completeLogin(await authService.verifyOtpLogin(payload))
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    try {
      // Sends the refresh cookie automatically; the server blacklists it and
      // clears both cookies. Nothing to clear on this side.
      await authService.logout()
    } catch {
      // Already signed out locally; a failed blacklist call isn't user-facing.
    }
  }, [])

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await authService.updateProfile(payload)
    setUser(updated)
    return updated
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isInitializing,
        login,
        register,
        verifyEmail,
        loginWithOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
