import { Sparkles } from 'lucide-react'
import { BULK_DISCOUNT_PERCENTAGE, BULK_DISCOUNT_THRESHOLD } from '@/utils/discountTiers'
import { formatCurrency } from '@/utils/formatCurrency'

/**
 * Site-wide announcement strip above the navbar - the automatic bulk
 * discount applies itself once an order crosses the threshold, so this is
 * purely informational (nothing to type or apply).
 */
export function PromoBar() {
  return (
    <div className="bg-chocolate-950 py-2 text-center text-cream-50">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs">
        <Sparkles size={13} className="shrink-0 text-gold-400" />
        <span>
          Get <span className="text-gold-400">{BULK_DISCOUNT_PERCENTAGE}% off</span> automatically on orders over{' '}
          {formatCurrency(BULK_DISCOUNT_THRESHOLD)}
        </span>
      </p>
    </div>
  )
}
