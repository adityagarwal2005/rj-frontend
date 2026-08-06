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
  // Cart-mutating calls can resolve out of order (e.g. an addItem fired after
  // a debounced quantity update can still resolve first). Each call captures
  // the request id current when it *started*; a response is only applied if
  // no newer request has started since, so the freshest action always wins
  // instead of whichever response happens to land last.
  const requestIdRef = useRef(0)

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout)
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const requestId = ++requestIdRef.current
    try {
      const latest = await orderService.getCart()
      if (requestId === requestIdRef.current) setCart(latest)
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false)
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
    const requestId = ++requestIdRef.current
    const updated = await orderService.addCartItem(productId, quantity)
    if (requestId === requestIdRef.current) setCart(updated)
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
        const requestId = ++requestIdRef.current
        try {
          const updated = await orderService.updateCartItem(itemId, quantity)
          if (requestId === requestIdRef.current) setCart(updated)
          resolve()
        } catch (error) {
          if (requestId === requestIdRef.current) await refresh()
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
    const requestId = ++requestIdRef.current
    const updated = await orderService.removeCartItem(itemId)
    if (requestId === requestIdRef.current) setCart(updated)
  }, [])

  const applyPromoCode = useCallback(async (code: string) => {
    const requestId = ++requestIdRef.current
    const updated = await orderService.applyPromoCode(code)
    if (requestId === requestIdRef.current) setCart(updated)
  }, [])

  const removePromoCode = useCallback(async () => {
    const requestId = ++requestIdRef.current
    const updated = await orderService.removePromoCode()
    if (requestId === requestIdRef.current) setCart(updated)
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
