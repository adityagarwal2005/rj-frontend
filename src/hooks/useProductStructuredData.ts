import { useEffect } from 'react'
import type { ProductDetail } from '@/types/product'

const SITE_URL = 'https://rajwaditukda.in'
const SCRIPT_ID = 'product-structured-data'

/**
 * Injects Product JSON-LD (price, availability, rating) so Google can show
 * rich snippets - price and star rating directly in search results - for
 * this product page. Removed on unmount so it never leaks onto other pages.
 */
export function useProductStructuredData(product: ProductDetail | null) {
  useEffect(() => {
    if (!product) return

    const data: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images.map((img) => img.image),
      sku: String(product.id),
      brand: { '@type': 'Brand', name: 'RajwadiTukda' },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/products/${product.slug}`,
        priceCurrency: 'INR',
        price: product.effective_price,
        availability: product.in_stock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
    }

    if (product.review_count > 0 && product.average_rating !== null) {
      data.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.average_rating,
        reviewCount: product.review_count,
      }
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data)

    return () => {
      document.getElementById(SCRIPT_ID)?.remove()
    }
  }, [product])
}
