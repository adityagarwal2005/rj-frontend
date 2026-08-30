import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { trackEvent } from '@/utils/analytics'
import { ErrorFallback } from './ErrorFallback'
import { NotFoundPage } from '@/pages/NotFoundPage'

/**
 * Rendered by React Router when a route throws.
 *
 * RouterProvider handles route errors internally, so the ErrorBoundary
 * wrapped around it never sees them. Without this, React Router falls back
 * to its own built-in screen - which prints "Unexpected Application Error!"
 * and a raw JavaScript stack trace to the customer.
 */
export function RouteErrorElement() {
  const error = useRouteError()

  useEffect(() => {
    console.error('Route error:', error)
    const message = error instanceof Error ? error.message : String(error)
    trackEvent('route_error', { message })
  }, [error])

  // A thrown 404 (or any Response) is a missing page, not a crash - show the
  // normal branded not-found screen rather than an error screen.
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  return <ErrorFallback />
}
