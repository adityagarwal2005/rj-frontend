/**
 * Mirrors the backend's discount tiers (apps/orders/pricing.py) for display
 * purposes only - e.g. "spend more to unlock X% off" messaging. The actual
 * discount applied always comes from the backend response; this is never
 * used to compute a real price.
 */
const TIERS = [
  { threshold: 200, percentage: 10 },
  { threshold: 300, percentage: 15 },
  { threshold: 400, percentage: 20 },
]

export function nextDiscountTier(subtotal: number) {
  return TIERS.find((tier) => subtotal < tier.threshold) ?? null
}
