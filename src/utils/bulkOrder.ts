/** At or above this many total units, checkout is replaced with a bulk-enquiry CTA. */
export const BULK_ORDER_THRESHOLD = 10

export function isBulkOrder(totalQuantity: number): boolean {
  return totalQuantity >= BULK_ORDER_THRESHOLD
}
