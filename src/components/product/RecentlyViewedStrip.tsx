import { Link } from 'react-router-dom'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { ProductImagePlaceholder } from './ProductImagePlaceholder'

interface RecentlyViewedStripProps {
  /** Exclude the product currently being viewed, if any. */
  excludeSlug?: string
  title?: string
}

export function RecentlyViewedStrip({ excludeSlug, title = 'Recently Viewed' }: RecentlyViewedStripProps) {
  const items = useRecentlyViewed(excludeSlug)

  if (items.length === 0) return null

  return (
    <div>
      <h2 className="mb-5 font-serif text-2xl text-chocolate-950">{title}</h2>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((item) => (
          <Link
            key={item.slug}
            to={ROUTES.productDetail(item.slug)}
            className="group flex w-40 shrink-0 flex-col gap-2 rounded-2xl border border-beige-200/80 bg-white/70 p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury"
          >
            <div className="aspect-square overflow-hidden rounded-xl">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <ProductImagePlaceholder />
              )}
            </div>
            <p className="truncate font-serif text-sm text-chocolate-950">{item.name}</p>
            <p className="text-xs text-ink-900/50">{item.weight_label}</p>
            <p className="text-sm font-medium text-chocolate-950">{formatCurrency(item.effective_price)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
