import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Heart, Leaf, Minus, Plus, Share2, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react'
import { productService } from '@/services/productService'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import type { ProductDetail } from '@/types/product'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { nextReachableTier } from '@/utils/discountTiers'
import { unitPriceForQuantity } from '@/utils/productPricing'
import { isLowStock } from '@/utils/stockUrgency'
import { trackEvent } from '@/utils/analytics'
import { cn } from '@/utils/cn'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { PromoTiles } from '@/components/product/PromoTiles'
import { ReviewList } from '@/components/product/ReviewList'
import { RecentlyViewedStrip } from '@/components/product/RecentlyViewedStrip'
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useProductStructuredData } from '@/hooks/useProductStructuredData'
import { useBreadcrumbStructuredData } from '@/hooks/useBreadcrumbStructuredData'
import { recordProductView } from '@/utils/recentlyViewed'

type LoadState = 'loading' | 'success' | 'error' | 'not-found'

const PROMISES = [
  { icon: Leaf, label: 'Made fresh to order' },
  { icon: Truck, label: 'Same-day in Jaipur' },
  { icon: ShieldCheck, label: 'Secure checkout' },
]

function ProductDetailSkeleton() {
  return (
    <Container className="pb-20 pt-6 sm:pt-10" role="status" aria-label="Loading product">
      <Skeleton className="h-3 w-52" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Skeleton className="aspect-square w-full rounded-[26px]" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-9 w-40" />
          <Skeleton className="mt-2 h-24 w-full" />
          <Skeleton className="mt-4 h-14 w-full rounded-full" />
        </div>
      </div>
    </Container>
  )
}

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const buyBoxRef = useRef<HTMLDivElement>(null)

  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useDocumentTitle(product ? `${product.name} — Handmade in Jaipur` : 'Product', {
    // Product descriptions are written as marketing copy and can run past
    // the ~155 chars Google shows, so trim on a word boundary rather than
    // letting the snippet cut mid-word.
    description: product
      ? `${product.description.slice(0, 150).replace(/\s+\S*$/, '')}… Made fresh to order in Jaipur.`
      : undefined,
    canonicalPath: `/products/${slug}`,
    image: product?.images.find((img) => img.is_primary)?.image ?? product?.images[0]?.image,
  })
  useProductStructuredData(product)
  useBreadcrumbStructuredData(
    product
      ? [
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/products' },
          { name: product.category.name, path: `/products?category=${product.category.slug}` },
          { name: product.name },
        ]
      : null,
  )

  useEffect(() => {
    let isMounted = true
    setState('loading')
    productService
      .getBySlug(slug)
      .then((data) => {
        if (!isMounted) return
        setProduct(data)
        setActiveImage(data.images.find((img) => img.is_primary)?.image ?? data.images[0]?.image ?? null)
        setQuantity(1)
        setIsWishlisted(data.is_wishlisted)
        setState('success')
        recordProductView(data)
      })
      .catch((error) => {
        if (!isMounted) return
        setState(error instanceof ApiError && error.status === 404 ? 'not-found' : 'error')
      })
    return () => {
      isMounted = false
    }
  }, [slug])

  // On phones, keep an "Add to cart" bar pinned to the bottom of the screen
  // whenever the main buy box has scrolled out of view.
  const isInStock = product?.in_stock ?? false
  useEffect(() => {
    const element = buyBoxRef.current
    if (!element || !isInStock) return
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [state, isInStock])

  async function handleAddToCart() {
    if (!product) return
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart.', 'info')
      navigate(ROUTES.login, { state: { from: location } })
      return
    }
    setIsAdding(true)
    try {
      await addItem(product.id, quantity)
      showToast(`${product.name} added to cart.`, 'success')
      trackEvent('add_to_cart', { item_id: product.id, item_name: product.name, quantity })
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not add item to cart.', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  function handleShare() {
    if (!product) return
    const message = `Check out ${product.name} from RajwadiTukda! ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  async function handleToggleWishlist() {
    if (!product) return
    if (!isAuthenticated) {
      showToast('Please log in to save items to your wishlist.', 'info')
      navigate(ROUTES.login, { state: { from: location } })
      return
    }
    setIsTogglingWishlist(true)
    const nextValue = !isWishlisted
    setIsWishlisted(nextValue)
    try {
      if (nextValue) {
        await productService.addToWishlist(product.slug)
        showToast('Saved to your wishlist.', 'success')
      } else {
        await productService.removeFromWishlist(product.slug)
      }
    } catch (error) {
      setIsWishlisted(!nextValue)
      showToast(error instanceof ApiError ? error.message : 'Could not update your wishlist.', 'error')
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  if (state === 'loading') {
    return <ProductDetailSkeleton />
  }

  if (state === 'not-found') {
    return (
      <Container className="py-16">
        <ErrorState title="Product not found" description="This chocolate may have been removed from our catalog." />
        <div className="mt-6 text-center">
          <Link to={ROUTES.products} className="text-sm font-medium text-gold-600 hover:underline">
            &larr; Back to shop
          </Link>
        </div>
      </Container>
    )
  }

  if (state === 'error' || !product) {
    return (
      <Container className="py-16">
        <ErrorState onRetry={() => window.location.reload()} />
      </Container>
    )
  }

  const unitPrice = unitPriceForQuantity(product, quantity)
  const subtotal = unitPrice * quantity
  const nextTier = nextReachableTier(subtotal)

  return (
    <>
      <Container className="pb-24 pt-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs text-ink-900/50">
          <Link to={ROUTES.home} className="shrink-0 transition-colors hover:text-chocolate-950">
            Home
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to={ROUTES.products} className="shrink-0 transition-colors hover:text-chocolate-950">
            Shop
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link
            to={`${ROUTES.products}?category=${product.category.slug}`}
            className="shrink-0 transition-colors hover:text-chocolate-950"
          >
            {product.category.name}
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="truncate text-chocolate-950" aria-current="page">
            {product.name}
          </span>
        </nav>

        <div className="mt-6 grid min-w-0 gap-10 sm:mt-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Gallery */}
          <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="group relative">
              {/* offset gold frame, matching the hero's jharokha treatment */}
              <div
                className="pointer-events-none absolute -inset-2.5 rounded-[32px] border border-gold-400/25 sm:-inset-3"
                aria-hidden="true"
              />
              <div className="relative aspect-square overflow-hidden rounded-[26px] bg-beige-200 shadow-luxury">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    fetchPriority="high"
                    className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
                  />
                ) : (
                  <ProductImagePlaceholder />
                )}
                {!product.in_stock && (
                  <span className="absolute left-4 top-4 rounded-full bg-red-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-50">
                    Sold out
                  </span>
                )}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="no-scrollbar -mx-1 mt-3 flex gap-2.5 overflow-x-auto p-1 sm:mt-4 sm:gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImage(image.image)}
                    aria-label={`Show photo ${index + 1}`}
                    aria-pressed={activeImage === image.image}
                    className={cn(
                      'h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl ring-offset-2 ring-offset-cream-50 transition-all duration-300 sm:h-20 sm:w-20',
                      activeImage === image.image ? 'ring-2 ring-gold-500' : 'opacity-60 hover:opacity-100',
                    )}
                  >
                    <img src={image.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow text-gold-600">{product.category.name}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  disabled={isTogglingWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={isWishlisted}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none',
                    isWishlisted
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-beige-300 text-chocolate-900 hover:border-red-300 hover:text-red-700',
                  )}
                >
                  <Heart size={16} strokeWidth={1.8} className={cn(isWishlisted && 'fill-current')} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share this product on WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-beige-300 text-chocolate-900 transition-colors hover:border-gold-400 hover:text-gold-600"
                >
                  <Share2 size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <h1 className="mt-3 font-display text-[42px] leading-[1.02] text-chocolate-950 sm:text-[58px]">{product.name}</h1>
            <p className="mt-2 font-script text-xl text-gold-600">Handmade in Jaipur</p>

            {product.review_count > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      size={14}
                      className={
                        value <= Math.round(product.average_rating ?? 0) ? 'fill-gold-500 text-gold-500' : 'text-beige-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-ink-900/60">
                  {product.average_rating?.toFixed(1)} &middot; {product.review_count} review
                  {product.review_count === 1 ? '' : 's'}
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-[32px] font-semibold tabular-nums tracking-tight text-chocolate-950">
                {formatCurrency(unitPrice)}
              </span>
              {product.discount_price && (
                <span className="text-base tabular-nums text-ink-900/40 line-through">{formatCurrency(product.price)}</span>
              )}
              <span className="rounded-full border border-beige-300 px-3 py-1 text-xs text-ink-900/60">{product.weight_label}</span>
              {product.in_stock && isLowStock(product.stock_quantity) && (
                <span className="rounded-full bg-jaipur-50 px-3 py-1 text-xs font-medium text-jaipur-700">
                  Only {product.stock_quantity} left
                </span>
              )}
            </div>
            {product.bulk_price && product.bulk_min_quantity && (
              <p className="mt-2 text-sm font-medium text-gold-600">
                Buy {product.bulk_min_quantity}+ for {formatCurrency(product.bulk_price)} each
              </p>
            )}

            <p className="mt-6 text-[15px] leading-relaxed text-ink-900/70">{product.description}</p>

            {product.in_stock ? (
              <div ref={buyBoxRef} className="mt-8">
                <div className="flex items-stretch gap-3">
                  <div className="flex h-14 items-center rounded-full border border-beige-300 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}
                      aria-label="Decrease quantity"
                      className="flex h-full w-11 items-center justify-center text-chocolate-900 hover:text-gold-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-7 text-center text-sm font-medium tabular-nums">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((qty) => Math.min(product.stock_quantity, qty + 1))}
                      aria-label="Increase quantity"
                      className="flex h-full w-11 items-center justify-center text-chocolate-900 hover:text-gold-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <Button variant="gold" size="lg" className="flex-1 px-5" isLoading={isAdding} onClick={handleAddToCart}>
                    Add to Cart
                    {quantity > 1 && <span className="tabular-nums">&middot; {formatCurrency(subtotal)}</span>}
                  </Button>
                </div>
                <p
                  className={cn(
                    'mt-3.5 flex items-center gap-1.5 text-xs',
                    nextTier ? 'text-gold-700' : 'text-emerald-700',
                  )}
                >
                  <Sparkles size={13} />
                  {nextTier
                    ? `Add ${formatCurrency(nextTier.threshold - subtotal)} more to unlock ${nextTier.percentage}% off`
                    : "You've unlocked the maximum discount on this order!"}
                </p>
              </div>
            ) : (
              <div className="mt-8 rounded-[18px] border border-beige-200 bg-white p-5">
                <p className="font-display text-2xl text-chocolate-950">Sold out for today</p>
                <p className="mt-1 text-sm text-ink-900/60">
                  We make small batches — check back soon, or message us on WhatsApp.
                </p>
              </div>
            )}

            <ul className="mt-8 grid grid-cols-3 gap-2 border-y border-beige-200 py-5">
              {PROMISES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-2 text-center text-[11px] font-medium leading-snug text-ink-900/65">
                  <Icon size={18} strokeWidth={1.5} className="text-gold-600" />
                  {label}
                </li>
              ))}
            </ul>

            {product.in_stock && (
              <div className="mt-6">
                <DeliveryEstimate />
              </div>
            )}

            {product.ingredients && (
              <div className="mt-8">
                <h2 className="eyebrow text-ink-900/55">Ingredients</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.ingredients.split(',').map((ingredient) => (
                    <span
                      key={ingredient}
                      className="rounded-full border border-beige-300 bg-white px-3 py-1.5 text-xs text-ink-900/70"
                    >
                      {ingredient.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <PromoTiles compact />
            </div>
          </div>
        </div>

        <section className="mt-20 border-t border-beige-200 pt-12">
          <p className="eyebrow text-gold-600">From our customers</p>
          <h2 className="mb-6 mt-2 font-display text-4xl text-chocolate-950">Reviews</h2>
          <ReviewList productSlug={product.slug} refreshKey={0} />
        </section>

        <div className="mt-16">
          <RecentlyViewedStrip excludeSlug={product.slug} />
        </div>
      </Container>

      {/* Zero-height sticky anchor: the bar rides the bottom of the screen
          while the page scrolls, then settles above the footer instead of
          covering it the way a position:fixed bar would. */}
      {product.in_stock && (
        <div className="sticky bottom-0 z-30 h-0 md:hidden">
          <div
            className={cn(
              'pb-safe absolute inset-x-0 bottom-0 border-t border-beige-200 bg-cream-50/95 px-4 pt-3 shadow-[0_-16px_32px_-24px_rgba(36,22,16,0.45)] transition-transform duration-300 ease-[var(--ease-luxe)]',
              showStickyBar ? 'translate-y-0' : 'translate-y-full',
            )}
            aria-hidden={!showStickyBar}
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg leading-tight text-chocolate-950">{product.name}</p>
                <p className="text-sm font-semibold tabular-nums text-chocolate-950">{formatCurrency(unitPrice)}</p>
              </div>
              <Button
                variant="gold"
                size="md"
                isLoading={isAdding}
                onClick={handleAddToCart}
                tabIndex={showStickyBar ? 0 : -1}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
