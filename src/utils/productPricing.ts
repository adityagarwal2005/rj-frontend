/**
 * Mirrors the backend's Product.price_for_quantity (apps/products/models.py)
 * for display purposes only, so ProductDetailPage/HomePage can show the
 * right per-unit price as the quantity stepper changes, before an actual
 * cart/order round-trip confirms it. The real charged amount always comes
 * from the backend's cart/order response.
 */

interface QuantityPricedProduct {
  effective_price: string
  bulk_price: string | null
  bulk_min_quantity: number | null
}

export function unitPriceForQuantity(product: QuantityPricedProduct, quantity: number): number {
  if (product.bulk_price && product.bulk_min_quantity && quantity >= product.bulk_min_quantity) {
    return Number.parseFloat(product.bulk_price)
  }
  return Number.parseFloat(product.effective_price)
}
