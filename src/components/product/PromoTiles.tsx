import { Percent, Users } from 'lucide-react'
import { BULK_DISCOUNT_PERCENTAGE, BULK_DISCOUNT_THRESHOLD } from '@/utils/discountTiers'
import { formatCurrency } from '@/utils/formatCurrency'

interface PromoTilesProps {
  /** Compact renders a tighter, single-row-friendly version for tighter spaces (e.g. PDP sidebar). */
  compact?: boolean
}

/**
 * Informational offer tiles - the bulk discount is automatic (applies
 * itself once an order crosses the threshold, nothing to type), and the
 * referral program is its own separate reward tracked on Profile.
 */
export function PromoTiles({ compact = false }: PromoTilesProps) {
  const offers = [
    {
      icon: Percent,
      title: `${BULK_DISCOUNT_PERCENTAGE}% off automatically`,
      description: `Applied at checkout on any order of ${formatCurrency(BULK_DISCOUNT_THRESHOLD)} or more - nothing to enter.`,
    },
    {
      icon: Users,
      title: 'Earn on referrals',
      description: 'Share your referral link (in your Profile) - your friend and you both save on their first order.',
    },
  ]

  return (
    <div className={compact ? 'grid gap-3' : 'grid gap-4 sm:grid-cols-2'}>
      {offers.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="flex items-start gap-3 rounded-2xl border border-dashed border-gold-400/50 bg-gold-400/5 p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400/15">
            <Icon size={16} className="text-gold-600" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-chocolate-950">{title}</span>
            <p className="mt-1 text-xs text-ink-900/60">{description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
