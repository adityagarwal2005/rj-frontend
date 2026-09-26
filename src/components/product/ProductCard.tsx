import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Plus, Star } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { productService } from '@/services/productService'
import { ApiError } from '@/services/apiError'
import type { ProductListItem } from '@/types/product'
import { isLowStock } from '@/utils/stockUrgency'
import { trackEvent } from '@/utils/analytics'
import { cn } from '@/utils/cn'
import { Spinner } from '@/components/ui/Spinner'
import { ProductImagePlaceholder } from './ProductImagePlaceholder'

function CardBadge({ tone, children }: { tone: 'dark' | 'light' | 'danger'; children: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] shadow-soft backdrop-saturate-150',
        tone === 'dark' && 'bg-chocolate-950/88 text-gold-300',
        tone === 'light' && 'bg-cream-50/95 text-chocolate-950',
        tone === 'danger' && 'bg-red-800/92 text-cream-50',
      )}
    >
      {children}
    </span>
  )
}

export function ProductCard({ product }: { product: ProductListItem }) {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(product.is_wishlisted)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)

  const hasDiscount = product.discount_price !== null
  const productUrl = ROUTES.productDetail(product.slug)

  async function handleAddToCart() {
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart.', 'info')
      navigate(ROUTES.login, { state: { from: location } })
      return
    }
    setIsAdding(true)
    try {
      await addItem(product.id, 1)
      showToast(`${product.name} added to cart.`, 'success')
      trackEvent('add_to_cart', { item_id: product.id, item_name: product.name, quantity: 1 })
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not add item to cart.', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleToggleWishlist() {
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

  return (
    <article className="group flex min-w-0 flex-col">
      {/* The wishlist button is a sibling of the image link, not a child:
          a button nested inside an <a> is invalid HTML and made every tap
          on the heart a navigation fight. */}
      <div className="relative">
        {/* Gold hairline sitting a few pixels behind the photo - reads as a
            mount or frame rather than a plain cropped image. */}
        <div
          className="pointer-events-none absolute -inset-[5px] rounded-[22px] border border-gold-400/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:rounded-[26px]"
          aria-hidden="true"
        />
        <Link
          to={productUrl}
          className="media-swap relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-beige-200 shadow-soft sm:rounded-[22px]"
          aria-label={product.name}
        >
          {product.primary_image ? (
            <>
              <img
                src={product.primary_image}
                alt={product.name}
                className="media-a absolute inset-0 h-full w-full object-cover group-hover:scale-[1.04]"
                loading="lazy"
                decoding="async"
                width={800}
                height={1000}
              />
              {product.secondary_image && (
                <img
                  src={product.secondary_image}
                  alt=""
                  aria-hidden="true"
                  className="media-b absolute inset-0 h-full w-full scale-[1.04] object-cover"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={1000}
                />
              )}
            </>
          ) : (
            <ProductImagePlaceholder />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate-950/30 via-transparent to-transparent" />

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {!product.in_stock ? (
              <CardBadge tone="danger">Sold out</CardBadge>
            ) : (
              <>
                {product.is_featured && <CardBadge tone="dark">Signature</CardBadge>}
                {isLowStock(product.stock_quantity) && <CardBadge tone="light">{`Only ${product.stock_quantity} left`}</CardBadge>}
              </>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
          className={cn(
            'absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-cream-50/92 shadow-soft transition-all duration-300 hover:scale-110 active:scale-95 disabled:pointer-events-none sm:right-3 sm:top-3',
            isWishlisted ? 'text-red-700' : 'text-chocolate-900 hover:text-red-700',
          )}
        >
          <Heart size={15} strokeWidth={1.8} className={cn(isWishlisted && 'fill-current')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-3.5 sm:pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[9.5px] font-semibold uppercase tracking-[0.2em] text-gold-600 sm:text-[10px]">
            {product.category}
          </span>
          {product.review_count > 0 && product.average_rating !== null && (
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-900/60">
              <Star size={11} className="fill-gold-500 text-gold-500" />
              {product.average_rating.toFixed(1)}
            </span>
          )}
        </div>

        <Link to={productUrl} className="mt-1.5">
          <h3 className="font-display text-[21px] leading-[1.1] text-chocolate-950 transition-colors duration-300 group-hover:text-gold-700 sm:text-[26px]">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-ink-900/45">{product.weight_label}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-display text-[22px] font-semibold leading-none tabular-nums text-chocolate-950 sm:text-2xl">
                {formatCurrency(product.effective_price)}
              </span>
              {hasDiscount && (
                <span className="text-xs tabular-nums text-ink-900/40 line-through">{formatCurrency(product.price)}</span>
              )}
            </div>
            {product.bulk_price && product.bulk_min_quantity && (
              <span className="mt-1 block text-[10.5px] font-medium leading-snug text-gold-600 sm:text-[11px]">
                {product.bulk_min_quantity}+ for {formatCurrency(product.bulk_price)} each
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.in_stock || isAdding}
            aria-label={`Add ${product.name} to cart`}
            className="shine flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chocolate-950 text-cream-50 shadow-soft transition-all duration-300 hover:bg-gold-500 hover:text-chocolate-950 hover:shadow-gold active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-chocolate-950 disabled:hover:text-cream-50 disabled:hover:shadow-soft"
          >
            {isAdding ? <Spinner size={15} className="text-current" /> : <Plus size={18} strokeWidth={1.8} />}
          </button>
        </div>
      </div>
    </article>
  )
}
