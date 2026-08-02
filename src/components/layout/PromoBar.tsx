import { Sparkles } from 'lucide-react'
import { getHeadlineTiers } from '@/utils/discountTiers'

/**
 * Site-wide announcement strip above the navbar - the "big highlight" for
 * the automatic quantity discount, since the small incentive line under
 * Add to Cart was easy for a first-time visitor to miss entirely.
 */
export function PromoBar() {
  const [entryTier, maxTier] = getHeadlineTiers()

  return (
    <div className="bg-chocolate-950 py-2 text-center text-cream-50">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs">
        <Sparkles size={13} className="shrink-0 text-gold-400" />
        <span>
          <span className="text-gold-400">{entryTier.percentage}% OFF</span> every order
        </span>
        <span className="hidden text-cream-50/40 sm:inline">&bull;</span>
        <span>
          <span className="text-gold-400">{maxTier.percentage}% OFF</span> when you order 2+
        </span>
        <span className="hidden text-cream-50/40 sm:inline">&bull;</span>
        <span className="text-cream-50/70">automatically applied, no code needed</span>
      </p>
    </div>
  )
}
