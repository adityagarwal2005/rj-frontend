import type { ProductListItem } from '@/types/product'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/Skeleton'

// Two across on a phone (the way people actually browse a shop there), and
// centered fixed-width columns from large screens up so a small catalog
// doesn't leave a lonely card stranded at the left edge.
const GRID_CLASSES =
  'grid grid-cols-2 gap-x-3.5 gap-y-9 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-[repeat(auto-fit,minmax(280px,340px))] lg:justify-center'

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  return (
    <div className={GRID_CLASSES}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES} role="status" aria-label="Loading chocolates">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col">
          <Skeleton className="aspect-[4/5] w-full rounded-[18px] sm:rounded-[22px]" />
          <Skeleton className="mt-4 h-2.5 w-1/3" />
          <Skeleton className="mt-2.5 h-5 w-3/4" />
          <div className="mt-4 flex items-end justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
