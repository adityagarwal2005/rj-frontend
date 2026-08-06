import { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
import { CUTOFF_LABEL, formatTimeRemaining, getDeliveryEstimate } from '@/utils/deliveryEstimate'

/** Real order-by cutoff for same-day delivery within Jaipur - see utils/deliveryEstimate. */
export function DeliveryEstimate({ className }: { className?: string }) {
  const [estimate, setEstimate] = useState(() => getDeliveryEstimate())

  useEffect(() => {
    const interval = setInterval(() => setEstimate(getDeliveryEstimate()), 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-start gap-3 rounded-2xl border border-beige-200 bg-cream-100/60 p-4 ${className ?? ''}`}>
      <Truck size={18} className="mt-0.5 shrink-0 text-gold-600" />
      <div className="text-sm">
        {estimate.isBeforeCutoff ? (
          <>
            <p className="font-medium text-chocolate-950">
              Order within {formatTimeRemaining(estimate.msUntilCutoff ?? 0)} for delivery today
            </p>
            <p className="mt-0.5 text-xs text-ink-900/50">Same-day cutoff is {CUTOFF_LABEL} IST, Jaipur only.</p>
          </>
        ) : (
          <>
            <p className="font-medium text-chocolate-950">Order now for delivery tomorrow</p>
            <p className="mt-0.5 text-xs text-ink-900/50">Today's {CUTOFF_LABEL} cutoff has passed.</p>
          </>
        )}
      </div>
    </div>
  )
}
