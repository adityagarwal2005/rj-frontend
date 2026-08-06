import type { ProductDetail } from '@/types/product'

const STORAGE_KEY = 'rajwaditukda.recently_viewed'
const MAX_ITEMS = 8

export interface RecentlyViewedProduct {
  slug: string
  name: string
  image: string | null
  effective_price: string
  weight_label: string
}

function readAll(): RecentlyViewedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RecentlyViewedProduct[]) : []
  } catch {
    return []
  }
}

function writeAll(items: RecentlyViewedProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage can be unavailable (private browsing, storage full) -
    // recently-viewed just won't persist; not worth surfacing to the user.
  }
}

/** Call once a product's real detail data has loaded - not on route change alone. */
export function recordProductView(product: ProductDetail): void {
  const image = product.images.find((img) => img.is_primary)?.image ?? product.images[0]?.image ?? null
  const entry: RecentlyViewedProduct = {
    slug: product.slug,
    name: product.name,
    image,
    effective_price: product.effective_price,
    weight_label: product.weight_label,
  }
  const withoutThisProduct = readAll().filter((item) => item.slug !== product.slug)
  writeAll([entry, ...withoutThisProduct].slice(0, MAX_ITEMS))
}

export function getRecentlyViewed(excludeSlug?: string): RecentlyViewedProduct[] {
  return readAll().filter((item) => item.slug !== excludeSlug)
}
