import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { productService } from '@/services/productService'
import type { Category, ProductListItem } from '@/types/product'
import type { Paginated } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pageMeta } from '@/constants/pageMeta'
import { useBreadcrumbStructuredData } from '@/hooks/useBreadcrumbStructuredData'
import { Container } from '@/components/ui/Container'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid'
import { cn } from '@/utils/cn'

type LoadState = 'loading' | 'success' | 'error'

function CategoryChip({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'h-10 shrink-0 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300',
        isActive
          ? 'bg-chocolate-950 text-cream-50'
          : 'border border-beige-300 bg-white text-chocolate-900 hover:border-gold-500 hover:text-gold-700',
      )}
    >
      {children}
    </button>
  )
}

export function ProductListPage() {
  useDocumentTitle(pageMeta('/products').title, {
    description: pageMeta('/products').description,
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

  const resultCount = page?.count ?? 0

  return (
    <div>
      {/* A short header band rather than the old full-screen one: on a phone
          that used to push every product below the fold. */}
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 text-cream-50">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.04]" aria-hidden="true" />
        <Container className="py-12 sm:py-16 lg:py-20">
          <SectionHeading
            as="h1"
            tone="dark"
            spacing="none"
            eyebrow="The Collection"
            title={
              <>
                Shop <span className="italic text-gradient-gold">Handcrafted</span> Chocolates in Jaipur
              </>
            }
            description="Kunafa chocolate bars and lollipops, tempered and finished by hand in our Bani Park kitchen and made the day they ship — with same-day delivery across Jaipur."
          />
        </Container>
      </section>

      <div className="border-b border-beige-200 bg-cream-50 sm:sticky sm:top-16 sm:z-20">
        <Container className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <CategoryChip isActive={activeCategory === ''} onClick={() => updateParam('category', '')}>
              All
            </CategoryChip>
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                isActive={activeCategory === category.slug}
                onClick={() => updateParam('category', category.slug)}
              >
                {category.name}
              </CategoryChip>
            ))}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative min-w-0 flex-1 sm:flex-initial">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-900/40" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search chocolates"
                aria-label="Search chocolates"
                className="h-10 w-full min-w-0 rounded-full border border-beige-300 bg-white pl-9 pr-3 text-sm transition-colors placeholder:text-ink-900/40 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/30 sm:w-56"
              />
            </form>

            <select
              value={activeOrdering}
              onChange={(event) => updateParam('ordering', event.target.value)}
              aria-label="Sort by"
              className="h-10 shrink-0 rounded-full border border-beige-300 bg-white px-3 text-sm text-chocolate-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
            >
              <option value="">Featured</option>
              <option value="-created_at">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        {state === 'success' && page && page.results.length > 0 && (
          <p className="mb-7 text-sm text-ink-900/50">
            {resultCount} chocolate{resultCount === 1 ? '' : 's'}
            {activeSearch && <> for &ldquo;{activeSearch}&rdquo;</>}
          </p>
        )}

        {state === 'loading' && <ProductGridSkeleton count={3} />}

        {state === 'error' && (
          <ErrorState
            title="Couldn't load the catalog"
            description="Please check your connection and try again."
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        )}

        {state === 'success' && page && page.results.length === 0 && (
          <div className="mx-auto max-w-xl py-6">
            <EmptyState icon={Search} title="No chocolates found" description="Try a different search or category." />
          </div>
        )}

        {state === 'success' && page && page.results.length > 0 && (
          <>
            <ProductGrid products={page.results} />
            <div className="mt-14">
              <Pagination currentPage={page.current_page} totalPages={page.total_pages} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </Container>
    </div>
  )
}
