import { RouterProvider } from 'react-router-dom'
import { ToastProvider } from '@/context/ToastContext'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ToastContainer } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { router } from '@/routes/router'

function App() {
  return (
    // Outermost on purpose: a throw inside any provider (a malformed value in
    // localStorage reaching AuthProvider, say) would otherwise escape every
    // boundary and blank the page.
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <ToastContainer />
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
