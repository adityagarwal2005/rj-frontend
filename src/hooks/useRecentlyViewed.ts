import { useEffect, useState } from 'react'
import { getRecentlyViewed, type RecentlyViewedProduct } from '@/utils/recentlyViewed'

/** Reads real browsing history from localStorage - see utils/recentlyViewed. */
export function useRecentlyViewed(excludeSlug?: string): RecentlyViewedProduct[] {
  const [items, setItems] = useState<RecentlyViewedProduct[]>([])

  useEffect(() => {
    setItems(getRecentlyViewed(excludeSlug))
  }, [excludeSlug])

  return items
}
