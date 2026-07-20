import type { AuthTokens } from '@/types/auth'

const ACCESS_KEY = 'rajwaditukda.access'
const REFRESH_KEY = 'rajwaditukda.refresh'

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),

  setTokens: ({ access, refresh }: AuthTokens) => {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },

  setAccess: (access: string) => {
    localStorage.setItem(ACCESS_KEY, access)
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
