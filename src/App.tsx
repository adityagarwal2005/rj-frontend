import { RouterProvider } from 'react-router-dom'
import { ToastProvider } from '@/context/ToastContext'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ToastContainer } from '@/components/ui/Toast'
import { router } from '@/routes/router'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ToastContainer />
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
