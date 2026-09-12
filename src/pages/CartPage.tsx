import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Lock, Minus, Plus, ShoppingBag, Sparkles, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { BULK_DISCOUNT_PERCENTAGE, BULK_DISCOUNT_THRESHOLD, nextReachableTier } from '@/utils/discountTiers'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Button, buttonClasses } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BrandLoader } from '@/components/ui/BrandLoader'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriceBreakdown } from '@/components/orders/PriceBreakdown'
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'

export function CartPage() {
  useDocumentTitle('Your Cart', { noindex: true })
  const { cart, isLoading, itemCount, updateItem, removeItem } = useCart()
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
    return <BrandLoader label="Loading your cart" />
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="max-w-2xl py-16 sm:py-24">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Something sweet is waiting for you in the shop."
          action={
            <Link to={ROUTES.products} className={`${buttonClasses('gold', 'md')} mt-3`}>
              Browse Chocolates
            </Link>
          }
        />
      </Container>
    )
  }

  const subtotal = Number.parseFloat(cart.subtotal_amount)
  const nextTier = nextReachableTier(subtotal)
  const progress = Math.min(100, (subtotal / BULK_DISCOUNT_THRESHOLD) * 100)

  return (
    <>
      <Container className="pb-16 pt-10 sm:pt-14 lg:pb-24">
        <div className="flex items-end justify-between gap-4 border-b border-beige-200 pb-6">
          <div>
            <p className="eyebrow text-gold-600">Your Selection</p>
            <h1 className="mt-2 font-display text-[42px] leading-none text-chocolate-950 sm:text-[56px]">Your Cart</h1>
          </div>
          <p className="pb-1 text-sm text-ink-900/55">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </p>
        </div>

        <div className="mt-8 grid min-w-0 gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div className="min-w-0">
            <div className="rounded-[18px] border border-gold-400/30 bg-white p-4 sm:p-5">
              <p className="flex items-center gap-2 text-sm text-chocolate-950">
                <Sparkles size={15} className="shrink-0 text-gold-600" />
                {nextTier ? (
                  <span>
                    Add <strong className="font-semibold tabular-nums">{formatCurrency(nextTier.threshold - subtotal)}</strong> more
                    to unlock {nextTier.percentage}% off
                  </span>
                ) : (
                  <span>
                    You&rsquo;ve unlocked <strong className="font-semibold">{BULK_DISCOUNT_PERCENTAGE}% off</strong> this order
                  </span>
                )}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-beige-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#cfae6c,#af8a48)] transition-[width] duration-700 ease-[var(--ease-luxe)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="mt-6 divide-y divide-beige-200 border-y border-beige-200">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-5 sm:gap-5 sm:py-6">
                  <Link
                    to={ROUTES.productDetail(item.product_slug)}
                    className="h-[104px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-beige-200 sm:h-28 sm:w-24"
                  >
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <ProductImagePlaceholder />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={ROUTES.productDetail(item.product_slug)}
                          className="block font-display text-[22px] leading-tight text-chocolate-950 transition-colors hover:text-gold-700"
                        >
                          {item.product_name}
                        </Link>
                        <p className="mt-0.5 text-sm tabular-nums text-ink-900/55">{formatCurrency(item.unit_price)} each</p>
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums text-chocolate-950">{formatCurrency(item.subtotal)}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex h-10 items-center rounded-full border border-beige-300 bg-white">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock_quantity)}
                          disabled={pendingItemId === item.id || item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.product_name}`}
                          className="flex h-full w-9 items-center justify-center text-chocolate-900 hover:text-gold-600 disabled:opacity-35"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock_quantity)}
                          disabled={pendingItemId === item.id || item.quantity >= item.stock_quantity}
                          aria-label={`Increase quantity of ${item.product_name}`}
                          className="flex h-full w-9 items-center justify-center text-chocolate-900 hover:text-gold-600 disabled:opacity-35"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        disabled={pendingItemId === item.id}
                        aria-label={`Remove ${item.product_name}`}
                        className="flex items-center gap-1.5 text-xs font-medium text-ink-900/50 transition-colors hover:text-red-800 disabled:opacity-40"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              to={ROUTES.products}
              className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-chocolate-900/70 transition-colors hover:text-chocolate-950"
            >
              <ArrowLeft size={14} /> Continue shopping
            </Link>
          </div>

          <aside className="h-fit lg:sticky lg:top-28">
            <Card>
              <h2 className="font-display text-[28px] leading-none text-chocolate-950">Order Summary</h2>
              <div className="mt-6">
                <PriceBreakdown
                  subtotalAmount={cart.subtotal_amount}
                  discountPercentage={cart.discount_percentage}
                  discountAmount={cart.discount_amount}
                  referralDiscountAmount={cart.referral_discount_amount}
                  totalAmount={cart.total_amount}
                />
              </div>
              <Button variant="gold" size="lg" className="mt-6 w-full" onClick={() => navigate(ROUTES.checkout)}>
                Proceed to Checkout <ArrowRight size={16} />
              </Button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-900/50">
                <Lock size={12} /> Secure checkout &middot; UPI, cards &amp; cash on delivery
              </p>
            </Card>
            <div className="mt-4">
              <DeliveryEstimate />
            </div>
          </aside>
        </div>
      </Container>

      <div className="sticky bottom-0 z-30 h-0 lg:hidden">
        <div className="pb-safe absolute inset-x-0 bottom-0 border-t border-beige-200 bg-cream-50/95 px-4 pt-3 shadow-[0_-16px_32px_-24px_rgba(36,22,16,0.45)]">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-900/50">Total</p>
              <p className="text-lg font-semibold tabular-nums text-chocolate-950">{formatCurrency(cart.total_amount)}</p>
            </div>
            <Button variant="gold" size="md" onClick={() => navigate(ROUTES.checkout)}>
              Checkout <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
