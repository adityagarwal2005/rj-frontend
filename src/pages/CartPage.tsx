import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Button, buttonClasses } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriceBreakdown } from '@/components/orders/PriceBreakdown'

export function CartPage() {
  useDocumentTitle('Your Cart')
  const { cart, isLoading, updateItem, removeItem } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)

  async function handleQuantityChange(itemId: number, nextQuantity: number) {
    if (nextQuantity < 1) return
    setPendingItemId(itemId)
    try {
      await updateItem(itemId, nextQuantity)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not update quantity.', 'error')
    } finally {
      setPendingItemId(null)
    }
  }

  async function handleRemove(itemId: number) {
    setPendingItemId(itemId)
    try {
      await removeItem(itemId)
      showToast('Item removed from cart.', 'info')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not remove item.', 'error')
    } finally {
      setPendingItemId(null)
    }
  }

  if (isLoading && !cart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some chocolate before you check out."
          action={
            <Link to={ROUTES.products} className={buttonClasses('gold', 'md')}>
              Browse Chocolates
            </Link>
          }
        />
      </Container>
    )
  }

  return (
    <Container className="py-16 sm:py-20">
      <h1 className="mb-10 font-serif text-4xl text-chocolate-950 sm:text-5xl">Your Cart</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-beige-200/80 bg-white/70 p-5 transition-colors duration-300 hover:border-gold-400/50"
            >
              <div>
                <p className="font-serif text-lg text-chocolate-950">{item.product_name}</p>
                <p className="text-sm text-ink-900/60">{formatCurrency(item.unit_price)} each</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border border-beige-300">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={pendingItemId === item.id}
                    aria-label="Decrease quantity"
                    className="p-2 text-chocolate-900 hover:text-gold-600 disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={pendingItemId === item.id}
                    aria-label="Increase quantity"
                    className="p-2 text-chocolate-900 hover:text-gold-600 disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span className="w-20 text-right font-medium text-chocolate-950">
                  {formatCurrency(item.subtotal)}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={pendingItemId === item.id}
                  aria-label={`Remove ${item.product_name}`}
                  className="p-2 text-red-800 hover:text-red-900 disabled:opacity-40"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Card className="h-fit">
          <h2 className="mb-4 font-serif text-xl text-chocolate-950">Order Summary</h2>
          <PriceBreakdown
            subtotalAmount={cart.subtotal_amount}
            discountPercentage={cart.discount_percentage}
            discountAmount={cart.discount_amount}
            totalAmount={cart.total_amount}
            showIncentive
          />
          <Button variant="gold" size="lg" className="mt-6 w-full" onClick={() => navigate(ROUTES.checkout)}>
            Proceed to Checkout
          </Button>
        </Card>
      </div>
    </Container>
  )
}
