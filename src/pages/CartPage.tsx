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
import { PromoCodeInput } from '@/components/orders/PromoCodeInput'

export function CartPage() {
  useDocumentTitle('Your Cart', { noindex: true })
  const { cart, isLoading, updateItem, removeItem } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)

  function handleQuantityChange(itemId: number, nextQuantity: number, stockQuantity: number) {
    if (nextQuantity < 1) return
    if (nextQuantity > stockQuantity) {
      showToast(`Only ${stockQuantity} unit(s) left in stock.`, 'info')
      return
    }
    // Not awaited/blocking: updateItem applies the new quantity to the UI
    // immediately and debounces the actual network call, so rapid +/- taps
    // shouldn't feel gated on a round trip. Only a failure needs a toast.
    updateItem(itemId, nextQuantity).catch((error) => {
      showToast(error instanceof ApiError ? error.message : 'Could not update quantity.', 'error')
    })
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

      <div className="grid min-w-0 gap-10 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-beige-200/80 bg-white/70 p-4 transition-colors duration-300 hover:border-gold-400/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
            >
              <div className="flex min-w-0 items-start justify-between gap-2 sm:block">
                <div className="min-w-0">
                  <p className="truncate font-serif text-lg text-chocolate-950">{item.product_name}</p>
                  <p className="text-sm text-ink-900/60">{formatCurrency(item.unit_price)} each</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={pendingItemId === item.id}
                  aria-label={`Remove ${item.product_name}`}
                  className="shrink-0 p-2 text-red-800 hover:text-red-900 disabled:opacity-40 sm:hidden"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-1.5 sm:justify-end sm:gap-4">
                <div className="flex items-center rounded-full border border-beige-300">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock_quantity)}
                    disabled={pendingItemId === item.id}
                    aria-label="Decrease quantity"
                    className="p-2 text-chocolate-900 hover:text-gold-600 disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock_quantity)}
                    disabled={pendingItemId === item.id || item.quantity >= item.stock_quantity}
                    aria-label="Increase quantity"
                    className="p-2 text-chocolate-900 hover:text-gold-600 disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span className="w-16 text-right font-medium text-chocolate-950 sm:w-20">
                  {formatCurrency(item.subtotal)}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={pendingItemId === item.id}
                  aria-label={`Remove ${item.product_name}`}
                  className="hidden p-2 text-red-800 hover:text-red-900 disabled:opacity-40 sm:block"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Card className="h-fit min-w-0">
          <h2 className="mb-4 font-serif text-xl text-chocolate-950">Order Summary</h2>
          <div className="mb-4">
            <PromoCodeInput cart={cart} />
          </div>
          <PriceBreakdown
            subtotalAmount={cart.subtotal_amount}
            discountPercentage={cart.discount_percentage}
            discountAmount={cart.discount_amount}
            referralDiscountAmount={cart.referral_discount_amount}
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
