import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { orderService } from '@/services/orderService'
import type { Cart } from '@/types/order'
import { useAuth } from './AuthContext'

interface CartContextValue {
  cart: Cart | null
  itemCount: number
  isLoading: boolean
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const latest = await orderService.getCart()
      setCart(latest)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isInitializing) return
    if (isAuthenticated) {
      void refresh()
    } else {
      setCart(null)
    }
  }, [isAuthenticated, isInitializing, refresh])

  const addItem = useCallback(async (productId: number, quantity = 1) => {
    const updated = await orderService.addCartItem(productId, quantity)
    setCart(updated)
  }, [])

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    const updated = await orderService.updateCartItem(itemId, quantity)
    setCart(updated)
  }, [])

  const removeItem = useCallback(async (itemId: number) => {
    const updated = await orderService.removeCartItem(itemId)
    setCart(updated)
  }, [])

  const itemCount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  )

  return (
    <CartContext.Provider
      value={{ cart, itemCount, isLoading, addItem, updateItem, removeItem, refresh }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
