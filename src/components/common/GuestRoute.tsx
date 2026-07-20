import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'

/** Layout route for Login/Register: bounces already-authenticated users to the home page. */
export function GuestRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) return null
  if (isAuthenticated) return <Navigate to={ROUTES.home} replace />

  return <Outlet />
}
