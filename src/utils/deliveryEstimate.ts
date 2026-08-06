/**
 * Real order-by cutoff for same-day delivery within Jaipur, computed in IST
 * regardless of the visitor's own timezone (a customer browsing from
 * abroad should still see Jaipur's local cutoff, not their own).
 */
const CUTOFF_HOUR_IST = 18 // 6:00 PM
export const CUTOFF_LABEL = '6:00 PM'

function getISTNow(now: Date): Date {
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
}

export interface DeliveryEstimate {
  isBeforeCutoff: boolean
  /** Milliseconds until the cutoff, only set when still before it. */
  msUntilCutoff: number | null
  /** "today" or "tomorrow", in Jaipur-local terms. */
  estimatedLabel: 'today' | 'tomorrow'
}

export function getDeliveryEstimate(now: Date = new Date()): DeliveryEstimate {
  const istNow = getISTNow(now)
  const cutoff = new Date(istNow)
  cutoff.setHours(CUTOFF_HOUR_IST, 0, 0, 0)
  const isBeforeCutoff = istNow < cutoff

  return {
    isBeforeCutoff,
    msUntilCutoff: isBeforeCutoff ? cutoff.getTime() - istNow.getTime() : null,
    estimatedLabel: isBeforeCutoff ? 'today' : 'tomorrow',
  }
}

export function formatTimeRemaining(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
