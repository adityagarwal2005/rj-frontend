/** Below this remaining count, show a "only N left" urgency message. */
export const LOW_STOCK_THRESHOLD = 10

export function isLowStock(stockQuantity: number): boolean {
  return stockQuantity > 0 && stockQuantity <= LOW_STOCK_THRESHOLD
}
