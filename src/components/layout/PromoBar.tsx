import { Sparkles } from 'lucide-react'
import { getHeadlineTiers } from '@/utils/discountTiers'

/**
 * Site-wide announcement strip above the navbar - the "big highlight" for
 * the quantity discount codes, since the small incentive line under Add to
 * Cart was easy for a first-time visitor to miss entirely.
 */
export function PromoBar() {
  const [entryTier, maxTier] = getHeadlineTiers()

  return (
    <div className="bg-chocolate-950 py-2 text-center text-cream-50">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs">
        <Sparkles size={13} className="shrink-0 text-gold-400" />
        <span>
          Use code <span className="text-gold-400">SAVE{entryTier.percentage}</span> for {entryTier.percentage}% off
        </span>
        <span className="hidden text-cream-50/40 sm:inline">&bull;</span>
        <span>
          <span className="text-gold-400">SAVE{maxTier.percentage}</span> for {maxTier.percentage}% off on 2+
        </span>
        <span className="hidden text-cream-50/40 sm:inline">&bull;</span>
        <span className="text-cream-50/70">apply at cart</span>
      </p>
    </div>
  )
}
