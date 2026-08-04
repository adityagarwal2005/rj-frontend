import { useState } from 'react'
import { BadgeCheck, Tag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import type { Cart } from '@/types/order'
import { getHeadlineTiers } from '@/utils/discountTiers'
import { Button } from '@/components/ui/Button'

interface PromoCodeInputProps {
  cart: Cart
}

/**
 * The actual "type a code, watch the price drop" moment - discounts are
 * code-gated on the backend (see apps.orders.pricing), so applying here is
 * what makes the total in PriceBreakdown actually change, not cosmetic.
 */
export function PromoCodeInput({ cart }: PromoCodeInputProps) {
  const { applyPromoCode, removePromoCode } = useCart()
  const { showToast } = useToast()
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isApplied = Boolean(cart.applied_promo_code) && Number.parseFloat(cart.discount_amount) > 0
  const subtotal = Number.parseFloat(cart.subtotal_amount)
  const [entryTier, maxTier] = getHeadlineTiers()
  const suggestedCode = !cart.applied_promo_code
    ? subtotal >= maxTier.threshold
      ? `SAVE${maxTier.percentage}`
      : subtotal >= entryTier.threshold
        ? `SAVE${entryTier.percentage}`
        : null
    : null

  async function handleApply(codeToApply: string) {
    if (!codeToApply.trim()) return
    setIsSubmitting(true)
    try {
      await applyPromoCode(codeToApply)
      showToast(`${codeToApply.trim().toUpperCase()} applied - your total just dropped!`, 'success')
      setCode('')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not apply that code.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemove() {
    setIsSubmitting(true)
    try {
      await removePromoCode()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not remove that code.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isApplied) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          <BadgeCheck size={16} className="shrink-0" />
          {cart.applied_promo_code} applied - {Number.parseFloat(cart.discount_percentage)}% off!
        </span>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isSubmitting}
          className="shrink-0 text-xs font-semibold text-emerald-700 underline hover:text-emerald-900"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleApply(code)
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Tag size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Promo code"
            aria-label="Promo code"
            className="h-10 w-full rounded-full border border-beige-300 bg-cream-50 pl-9 pr-3 text-sm uppercase focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
          />
        </div>
        <Button type="submit" variant="outline" size="md" isLoading={isSubmitting} disabled={!code.trim()}>
          Apply
        </Button>
      </form>

      {suggestedCode && (
        <button
          type="button"
          onClick={() => handleApply(suggestedCode)}
          className="mt-2 text-xs font-medium text-gold-600 underline hover:text-gold-700"
        >
          You qualify for {suggestedCode} - tap to apply!
        </button>
      )}
    </div>
  )
}
