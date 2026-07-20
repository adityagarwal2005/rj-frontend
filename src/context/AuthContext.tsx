import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authService } from '@/services/authService'
import { onSessionExpired } from '@/services/authEvents'
import { tokenStorage } from '@/services/tokenStorage'
import type { LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '@/types/auth'
import { useToast } from './ToastContext'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    onSessionExpired(() => {
      setUser(null)
      showToast('Your session has expired. Please log in again.', 'info')
    })
  }, [showToast])

  useEffect(() => {
    async function bootstrap() {
      if (!tokenStorage.getAccess()) {
        setIsInitializing(false)
        return
      }
      try {
        const profile = await authService.getProfile()
        setUser(profile)
      } catch {
        tokenStorage.clear()
      } finally {
        setIsInitializing(false)
      }
    }
    void bootstrap()
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedInUser, access, refresh } = await authService.login(payload)
    tokenStorage.setTokens({ access, refresh })
    setUser(loggedInUser)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: newUser, access, refresh } = await authService.register(payload)
    tokenStorage.setTokens({ access, refresh })
    setUser(newUser)
  }, [])

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh()
    tokenStorage.clear()
    setUser(null)
    if (refresh) {
      try {
        await authService.logout(refresh)
      } catch {
        // Token is already cleared locally; a failed blacklist call isn't user-facing.
      }
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
