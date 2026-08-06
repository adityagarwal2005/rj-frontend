import { useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Plus } from 'lucide-react'
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
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ProductImagePlaceholder } from './ProductImagePlaceholder'

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

  async function handleToggleWishlist(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
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
    <div className="group flex flex-col overflow-hidden rounded-[28px] border border-beige-200/80 bg-white/70 shadow-luxury transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-400/40 hover:shadow-gold">
      <Link to={ROUTES.productDetail(product.slug)} className="relative aspect-square overflow-hidden">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <ProductImagePlaceholder className="transition-transform duration-700 ease-out group-hover:scale-110" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate-950/15 via-transparent to-transparent" />
        {!product.in_stock && (
          <span className="absolute left-3 top-3">
            <Badge tone="danger">Out of stock</Badge>
          </span>
        )}
        {product.is_featured && product.in_stock && (
          <span className="absolute left-3 top-3">
            <Badge tone="gold">Featured</Badge>
          </span>
        )}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={isWishlisted}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 disabled:pointer-events-none disabled:opacity-60',
              isWishlisted ? 'bg-white/90 text-red-700' : 'bg-white/60 text-chocolate-900 hover:text-red-700',
            )}
          >
            <Heart size={16} className={cn(isWishlisted && 'fill-current')} />
          </button>
          {isLowStock(product.stock_quantity) && <Badge tone="danger">Only {product.stock_quantity} left</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">{product.category}</span>
        <Link to={ROUTES.productDetail(product.slug)}>
          <h3 className="font-serif text-xl text-chocolate-950">{product.name}</h3>
        </Link>
        <p className="text-xs text-ink-900/50">{product.weight_label}</p>

        <div className="mt-4 flex items-center justify-between border-t border-beige-200 pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl text-chocolate-950">
              {formatCurrency(product.effective_price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-ink-900/40 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.in_stock || isAdding}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-chocolate-950 shadow-[0_6px_16px_-6px_rgba(175,138,72,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_10px_22px_-6px_rgba(175,138,72,0.6)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isAdding ? <Spinner size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
