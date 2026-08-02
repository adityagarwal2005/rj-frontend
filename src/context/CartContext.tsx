import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  applyPromoCode: (code: string) => Promise<void>
  removePromoCode: () => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

// Debounce window for quantity changes: a tap updates the visible number
// immediately (optimistic), but rapid +/- taps only send the *last*
// quantity to the server instead of one request per tap.
const UPDATE_DEBOUNCE_MS = 400

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

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
    // Optimistic: reflect the new quantity/subtotal instantly, don't wait on the network.
    setCart((current) => {
      if (!current) return current
      return {
        ...current,
        items: current.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity, subtotal: (Number.parseFloat(item.unit_price) * quantity).toFixed(2) }
            : item,
        ),
      }
    })

    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId])
    }

    return new Promise<void>((resolve, reject) => {
      debounceTimers.current[itemId] = setTimeout(async () => {
        try {
          const updated = await orderService.updateCartItem(itemId, quantity)
          setCart(updated)
          resolve()
        } catch (error) {
          await refresh()
          reject(error)
        } finally {
          delete debounceTimers.current[itemId]
        }
      }, UPDATE_DEBOUNCE_MS)
    })
  }, [refresh])

  const removeItem = useCallback(async (itemId: number) => {
    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId])
      delete debounceTimers.current[itemId]
    }
    const updated = await orderService.removeCartItem(itemId)
    setCart(updated)
  }, [])

  const applyPromoCode = useCallback(async (code: string) => {
    const updated = await orderService.applyPromoCode(code)
    setCart(updated)
  }, [])

  const removePromoCode = useCallback(async () => {
    const updated = await orderService.removePromoCode()
    setCart(updated)
  }, [])

  const itemCount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  )

  return (
    <CartContext.Provider
      value={{ cart, itemCount, isLoading, addItem, updateItem, removeItem, applyPromoCode, removePromoCode, refresh }}
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
