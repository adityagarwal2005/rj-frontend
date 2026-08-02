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

/**
 * The entry and max tiers - the two that are actually reachable by a
 * customer buying whole units of a single ~200/bar product (200 -> 1 bar,
 * 400 -> 2 bars). Middle tiers can land on amounts no whole-unit purchase
 * ever hits, so promo messaging should stick to these two, not all of TIERS.
 */
export function getHeadlineTiers() {
  return [TIERS[0], TIERS[TIERS.length - 1]]
}

/**
 * Like nextDiscountTier, but skips tiers a single ~200/bar product can
 * never actually land on (e.g. the 300/15% tier - no whole-unit purchase
 * totals exactly 300). Use this for "add X more to unlock Y% off" nudges
 * so the promised threshold is one a customer can really reach.
 */
export function nextReachableTier(subtotal: number) {
  const [entryTier, maxTier] = getHeadlineTiers()
  if (subtotal < entryTier.threshold) return entryTier
  if (subtotal < maxTier.threshold) return maxTier
  return null
}
