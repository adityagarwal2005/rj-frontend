import { Component, type ErrorInfo, type ReactNode } from 'react'
import { trackEvent } from '@/utils/analytics'
import { ErrorFallback } from './ErrorFallback'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches render-time errors in the context providers above the router.
 *
 * Route errors are handled separately by RouteErrorElement, since
 * RouterProvider intercepts those before they reach this boundary. This one
 * covers the rest: a throw inside AuthProvider, CartProvider or
 * ToastProvider - say a malformed value in localStorage - which would
 * otherwise unmount the whole tree and leave a blank white page.
 *
 * Deliberately a class component: error boundaries have no hooks
 * equivalent, getDerivedStateFromError/componentDidCatch are still the only
 * React API for this.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surfaces in the browser console for anyone debugging, and in analytics
    // so a crash that only happens on real customers' devices still reaches us.
    console.error('Unhandled render error:', error, info.componentStack)
    trackEvent('render_error', { message: error.message })
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return <ErrorFallback />
  }
}
