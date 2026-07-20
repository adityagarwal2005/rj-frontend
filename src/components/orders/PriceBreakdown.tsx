import { Sparkles } from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'
import { nextDiscountTier } from '@/utils/discountTiers'

interface PriceBreakdownProps {
  subtotalAmount: string
  discountPercentage: string
  discountAmount: string
  totalAmount: string
  showIncentive?: boolean
}

export function PriceBreakdown({
  subtotalAmount,
  discountPercentage,
  discountAmount,
  totalAmount,
  showIncentive = false,
}: PriceBreakdownProps) {
  const discountPercentageNumber = Number.parseFloat(discountPercentage)
  const hasDiscount = discountPercentageNumber > 0
  const nextTier = showIncentive ? nextDiscountTier(Number.parseFloat(subtotalAmount)) : null

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between text-ink-900/70">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotalAmount)}</span>
      </div>

      {hasDiscount && (
        <div className="flex items-center justify-between text-emerald-700">
          <span>Discount ({discountPercentageNumber}% off)</span>
          <span>-{formatCurrency(discountAmount)}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-beige-200 pt-2 font-medium text-chocolate-950">
        <span>Total</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>

      {nextTier && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-gold-600">
          <Sparkles size={13} />
          Add {formatCurrency(nextTier.threshold - Number.parseFloat(subtotalAmount))} more to unlock{' '}
          {nextTier.percentage}% off!
        </p>
      )}
    </div>
  )
}
