import { Copy, Gift, Percent, Users } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { getHeadlineTiers } from '@/utils/discountTiers'
import { formatCurrency } from '@/utils/formatCurrency'

interface PromoTilesProps {
  /** Compact renders a tighter, single-row-friendly version for tighter spaces (e.g. PDP sidebar). */
  compact?: boolean
}

/**
 * Real discount codes (see apps.orders.pricing on the backend) - these have
 * to be typed into the promo box at cart to actually take effect, so each
 * tile doubles as a "tap to copy" shortcut for the code itself.
 */
export function PromoTiles({ compact = false }: PromoTilesProps) {
  const { showToast } = useToast()
  const [entryTier, maxTier] = getHeadlineTiers()

  const promos = [
    {
      code: `SAVE${entryTier.percentage}`,
      icon: Percent,
      title: `${entryTier.percentage}% off every order`,
      description: `Use this code at cart on any order of ${formatCurrency(entryTier.threshold)} or more.`,
      copyable: true,
    },
    {
      code: `SAVE${maxTier.percentage}`,
      icon: Gift,
      title: `${maxTier.percentage}% off - our best deal`,
      description: `Order 2 bars (${formatCurrency(maxTier.threshold)}+) and this code unlocks at cart.`,
      copyable: true,
    },
    {
      code: 'REFER30',
      icon: Users,
      title: '₹30 off for you and a friend',
      description: 'Share your referral link (in your Profile) - your friend saves ₹30, you earn ₹30 once they order.',
      copyable: false,
    },
  ]

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code).then(() => showToast(`${code} copied - paste it at cart!`, 'success'))
  }

  return (
    <div className={compact ? 'grid gap-3' : 'grid gap-4 sm:grid-cols-3'}>
      {promos.map(({ code, icon: Icon, title, description, copyable }) => (
        <div
          key={code}
          className="flex items-start gap-3 rounded-2xl border border-dashed border-gold-400/50 bg-gold-400/5 p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400/15">
            <Icon size={16} className="text-gold-600" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {copyable ? (
                <button
                  type="button"
                  onClick={() => handleCopy(code)}
                  className="flex items-center gap-1 rounded-full bg-chocolate-950 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-gold-400 transition-colors hover:bg-chocolate-900"
                >
                  {code} <Copy size={10} />
                </button>
              ) : (
                <span className="rounded-full bg-chocolate-950 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-gold-400">
                  {code}
                </span>
              )}
              <span className="text-sm font-semibold text-chocolate-950">{title}</span>
            </div>
            <p className="mt-1 text-xs text-ink-900/60">{description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
