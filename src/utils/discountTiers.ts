/**
 * Mirrors the backend's automatic bulk discount (apps/orders/pricing.py)
 * for display purposes only - e.g. "spend more to unlock 15% off" nudges.
 * The actual discount applied always comes from the backend response; this
 * is never used to compute a real price. No codes - crossing the
 * threshold applies the discount automatically.
 */
export const BULK_DISCOUNT_THRESHOLD = 800
export const BULK_DISCOUNT_PERCENTAGE = 5

/** Returns the threshold/percentage to nudge toward, or null once already unlocked. */
export function nextReachableTier(subtotal: number) {
  if (subtotal >= BULK_DISCOUNT_THRESHOLD) return null
  return { threshold: BULK_DISCOUNT_THRESHOLD, percentage: BULK_DISCOUNT_PERCENTAGE }
}
