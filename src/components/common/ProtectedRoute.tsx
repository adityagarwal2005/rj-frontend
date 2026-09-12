import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { BrandLoader } from '@/components/ui/BrandLoader'
import { ROUTES } from '@/constants/routes'

/** Layout route: redirects to /login (preserving destination) unless authenticated. */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <BrandLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  return <Outlet />
}
