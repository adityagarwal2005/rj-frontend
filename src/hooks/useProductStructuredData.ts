import type { ProductDetail } from '@/types/product'
import { SITE_URL } from '@/utils/seo'
import { useStructuredData } from './useStructuredData'

/**
 * Price quotes in Product schema need an expiry or Google logs a warning and
 * may drop the rich result. Nothing here is a time-limited sale, so this just
 * rolls a year forward rather than encoding a real end date.
 */
function priceValidUntil(): string {
  const oneYearOut = new Date()
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1)
  return oneYearOut.toISOString().split('T')[0]
}

/**
 * Injects Product JSON-LD (price, availability, rating, returns, delivery)
 * so Google can show rich snippets - price, stock status and star rating
 * directly in search results - for this product page.
 */
export function useProductStructuredData(product: ProductDetail | null) {
  const data = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images.map((img) => img.image),
        sku: String(product.id),
        category: product.category.name,
        brand: { '@type': 'Brand', name: 'RajwadiTukda' },
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/products/${product.slug}`,
          priceCurrency: 'INR',
          price: product.effective_price,
          priceValidUntil: priceValidUntil(),
          itemCondition: 'https://schema.org/NewCondition',
          availability: product.in_stock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: { '@id': `${SITE_URL}/#organization` },
          // Same-day, free, Jaipur-only - stated explicitly so Google can
          // surface delivery info alongside the price in shopping results.
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: 0,
              currency: 'INR',
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: 'IN',
              addressRegion: 'Rajasthan',
            },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 1,
                unitCode: 'DAY',
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 1,
                unitCode: 'DAY',
              },
            },
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'IN',
            // Perishable food made to order - see /refund-policy.
            returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
          },
        },
        ...(product.review_count > 0 && product.average_rating !== null
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.average_rating,
                reviewCount: product.review_count,
              },
            }
          : {}),
      }
    : null

  useStructuredData('product-structured-data', data)
}
