import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { productService } from '@/services/productService'
import type { Category, ProductListItem } from '@/types/product'
import type { Paginated } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useBreadcrumbStructuredData } from '@/hooks/useBreadcrumbStructuredData'
import { Container } from '@/components/ui/Container'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { LotusOrnament } from '@/components/ui/LotusOrnament'
import { PaisleyDivider } from '@/components/ui/PaisleyDivider'
import { RangoliCorner } from '@/components/ui/RangoliCorner'
import { HawaMahalSilhouette } from '@/components/ui/HawaMahalSilhouette'
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid'
import { cn } from '@/utils/cn'

type LoadState = 'loading' | 'success' | 'error'

export function ProductListPage() {
  useDocumentTitle('Buy Kunafa Chocolate & Lollipops Online', {
    description:
      'Shop handmade Kunafa chocolate, Kunafa and Biscoff lollipops, and Rajasthani-inspired chocolates. Made fresh to order in Jaipur with same-day delivery.',
    canonicalPath: '/products',
  })
  useBreadcrumbStructuredData([{ name: 'Home', path: '/' }, { name: 'Shop' }])
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState<Paginated<ProductListItem> | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const [retryCount, setRetryCount] = useState(0)

  const activeCategory = searchParams.get('category') ?? ''
  const activeSearch = searchParams.get('search') ?? ''
  const activeOrdering = searchParams.get('ordering') ?? ''
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
        ordering: (activeOrdering || undefined) as never,
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
    <div>
      {/* SHOP HERO — dark chocolate strip with Hawa Mahal silhouette, so
          the catalog page opens with the same heritage vocabulary as
          Home/About and does not feel like a bare listing page. */}
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 py-16 text-center text-cream-50 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.06]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        <RangoliCorner className="pointer-events-none absolute left-0 top-0 h-24 w-24 text-gold-400/25" aria-hidden="true" />
        <RangoliCorner className="pointer-events-none absolute right-0 top-0 h-24 w-24 -scale-x-100 text-gold-400/25" aria-hidden="true" />
        <HawaMahalSilhouette
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-gold-300/25 [mask-image:linear-gradient(to_top,black_60%,transparent)]"
          aria-hidden="true"
        />
        <Container>
          <LotusOrnament className="mx-auto h-4 w-24 text-gold-400" />
          <span className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.4em] text-gold-400">
            The Collection
          </span>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-6xl">
            Shop <span className="italic text-gradient-gold">Handcrafted</span> Chocolates in Jaipur
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream-50/65 sm:text-[15px]">
            Kunafa chocolate bars and lollipops, tempered and finished by hand in our Bani Park kitchen
            and made the day they ship — with same-day delivery across Jaipur.
          </p>
          <PaisleyDivider className="mx-auto mt-6 h-3 w-56 text-gold-400/70" />
        </Container>
      </section>

      <Container className="py-14 sm:py-16">
        <RevealOnScroll>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateParam('category', '')}
                className={cn(
                  'rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300',
                  activeCategory === ''
                    ? 'bg-chocolate-950 text-cream-50 shadow-[0_6px_16px_-8px_rgba(36,22,16,0.5)]'
                    : 'border border-beige-300 text-chocolate-900 hover:border-gold-500 hover:text-gold-600',
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
                    'rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300',
                    activeCategory === category.slug
                      ? 'bg-chocolate-950 text-cream-50 shadow-[0_6px_16px_-8px_rgba(36,22,16,0.5)]'
                      : 'border border-beige-300 text-chocolate-900 hover:border-gold-500 hover:text-gold-600',
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <form onSubmit={handleSearchSubmit} className="relative min-w-0 flex-1 sm:flex-initial">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search..."
                  aria-label="Search chocolates"
                  className="h-10 w-full min-w-0 rounded-full border border-beige-300 bg-white/70 pl-9 pr-3 text-sm shadow-[inset_0_1px_2px_rgba(36,22,16,0.03)] transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40 sm:w-56"
                />
              </form>

              <select
                value={activeOrdering}
                onChange={(event) => updateParam('ordering', event.target.value)}
                aria-label="Sort by"
                className="h-10 shrink-0 rounded-full border border-beige-300 bg-white/70 px-2 text-sm shadow-[inset_0_1px_2px_rgba(36,22,16,0.03)] focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40 sm:px-3"
              >
                <option value="">Featured</option>
                <option value="-created_at">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>
        </RevealOnScroll>

        {state === 'loading' && <ProductGridSkeleton />}

        {state === 'error' && (
          <ErrorState
            title="Couldn't load the catalog"
            description="Please check your connection and try again."
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        )}

        {state === 'success' && page && page.results.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-10">
            <PaisleyDivider className="h-4 w-64 text-gold-400/60" />
            <EmptyState title="No chocolates found" description="Try a different search or category." />
            <PaisleyDivider className="h-4 w-64 text-gold-400/60" />
          </div>
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
    </div>
  )
}
