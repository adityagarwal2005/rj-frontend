import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { productService } from '@/services/productService'
import type { ProductListItem } from '@/types/product'
import type { Paginated } from '@/types/api'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { buttonClasses } from '@/components/ui/Button'
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid'

type LoadState = 'loading' | 'success' | 'error'

export function WishlistPage() {
  useDocumentTitle('My Wishlist', { noindex: true })
  const [page, setPage] = useState<Paginated<ProductListItem> | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [currentPage, setCurrentPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isMounted = true
    setState('loading')
    productService
      .listWishlist(currentPage)
      .then((data) => {
        if (!isMounted) return
        setPage(data)
        setState('success')
      })
      .catch(() => {
        if (isMounted) setState('error')
      })
    return () => {
      isMounted = false
    }
  }, [currentPage, retryCount])

  return (
    <Container className="py-16 sm:py-20">
      <h1 className="mb-8 font-serif text-4xl text-chocolate-950">My Wishlist</h1>

      {state === 'loading' && <ProductGridSkeleton />}

      {state === 'error' && (
        <ErrorState title="Couldn't load your wishlist" onRetry={() => setRetryCount((count) => count + 1)} />
      )}

      {state === 'success' && page && page.results.length === 0 && (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any chocolate to save it here for later."
          action={
            <Link to={ROUTES.products} className={buttonClasses('gold', 'md')}>
              Browse Chocolates
            </Link>
          }
        />
      )}

      {state === 'success' && page && page.results.length > 0 && (
        <>
          <ProductGrid products={page.results} />
          <div className="mt-10">
            <Pagination currentPage={page.current_page} totalPages={page.total_pages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
    </Container>
  )
}
