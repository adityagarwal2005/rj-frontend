import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { productService } from '@/services/productService'
import type { Category, ProductListItem } from '@/types/product'
import type { Paginated } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid'
import { cn } from '@/utils/cn'

type LoadState = 'loading' | 'success' | 'error'

export function ProductListPage() {
  useDocumentTitle('Shop')
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState<Paginated<ProductListItem> | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const [retryCount, setRetryCount] = useState(0)

  const activeCategory = searchParams.get('category') ?? ''
  const activeSearch = searchParams.get('search') ?? ''
  const activeOrdering = searchParams.get('ordering') ?? '-created_at'
  const currentPage = Number(searchParams.get('page') ?? '1')

  useEffect(() => {
    productService.listCategories().then((data) => setCategories(data.results)).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let isMounted = true
    setState('loading')
    productService
      .list({
        category: activeCategory || undefined,
        search: activeSearch || undefined,
        ordering: activeOrdering as never,
        page: currentPage,
      })
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
  }, [activeCategory, activeSearch, activeOrdering, currentPage, retryCount])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    updateParam('search', searchInput.trim())
  }

  function handlePageChange(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Container className="py-16 sm:py-20">
      <div className="mb-12 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-600">The Collection</span>
        <h1 className="mt-3 font-serif text-4xl text-chocolate-950 sm:text-5xl">Shop Our Chocolates</h1>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParam('category', '')}
            className={cn(
              'rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors',
              activeCategory === ''
                ? 'bg-chocolate-950 text-cream-50'
                : 'border border-beige-300 text-chocolate-900 hover:border-chocolate-950',
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateParam('category', category.slug)}
              className={cn(
                'rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors',
                activeCategory === category.slug
                  ? 'bg-chocolate-950 text-cream-50'
                  : 'border border-beige-300 text-chocolate-900 hover:border-chocolate-950',
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search chocolates..."
              aria-label="Search chocolates"
              className="h-10 w-48 rounded-full border border-beige-300 bg-cream-50 pl-9 pr-3 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40 sm:w-56"
            />
          </form>

          <select
            value={activeOrdering}
            onChange={(event) => updateParam('ordering', event.target.value)}
            aria-label="Sort by"
            className="h-10 rounded-full border border-beige-300 bg-cream-50 px-3 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
          >
            <option value="-created_at">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
      </div>

      {state === 'loading' && <ProductGridSkeleton />}

      {state === 'error' && (
        <ErrorState
          title="Couldn't load the catalog"
          description="Please check your connection and try again."
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      )}

      {state === 'success' && page && page.results.length === 0 && (
        <EmptyState title="No chocolates found" description="Try a different search or category." />
      )}

      {state === 'success' && page && page.results.length > 0 && (
        <>
          <ProductGrid products={page.results} />
          <div className="mt-10">
            <Pagination currentPage={page.current_page} totalPages={page.total_pages} onPageChange={handlePageChange} />
          </div>
        </>
      )}
    </Container>
  )
}
