import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Minus, Plus, Share2, Sparkles } from 'lucide-react'
import { productService } from '@/services/productService'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import type { ProductDetail } from '@/types/product'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { nextDiscountTier } from '@/utils/discountTiers'
import { isLowStock } from '@/utils/stockUrgency'
import { trackEvent } from '@/utils/analytics'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

type LoadState = 'loading' | 'success' | 'error' | 'not-found'

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useDocumentTitle(product?.name ?? 'Product')

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
        setState('success')
      })
      .catch((error) => {
        if (!isMounted) return
        setState(error instanceof ApiError && error.status === 404 ? 'not-found' : 'error')
      })
    return () => {
      isMounted = false
    }
  }, [slug])

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

  if (state === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
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

  return (
    <Container className="py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-[28px] shadow-luxury-lg">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ProductImagePlaceholder />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(image.image)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                    activeImage === image.image ? 'border-gold-500' : 'border-transparent'
                  }`}
                >
                  <img src={image.image} alt={image.alt_text || product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-600">
              {product.category.name}
            </span>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this product on WhatsApp"
              className="flex items-center gap-1.5 rounded-full border border-beige-300 px-3 py-1.5 text-xs font-medium text-chocolate-900 transition-colors hover:border-gold-400 hover:text-gold-600"
            >
              <Share2 size={13} /> Share
            </button>
          </div>
          <h1 className="mt-3 font-serif text-4xl text-chocolate-950 sm:text-5xl">{product.name}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="font-serif text-3xl text-chocolate-950">
              {formatCurrency(product.effective_price)}
            </span>
            {product.discount_price && (
              <span className="text-sm text-ink-900/40 line-through">{formatCurrency(product.price)}</span>
            )}
            <Badge tone="neutral">{product.weight_label}</Badge>
            {!product.in_stock && <Badge tone="danger">Out of stock</Badge>}
            {product.in_stock && isLowStock(product.stock_quantity) && (
              <Badge tone="danger">Only {product.stock_quantity} left</Badge>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-ink-900/80">{product.description}</p>

          {product.in_stock && (
            <>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-beige-300">
                  <button
                    type="button"
                    onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                    className="p-3 text-chocolate-900 hover:text-gold-600"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((qty) => Math.min(product.stock_quantity, qty + 1))}
                    aria-label="Increase quantity"
                    className="p-3 text-chocolate-900 hover:text-gold-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <Button variant="gold" size="lg" isLoading={isAdding} onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>

              {(() => {
                const subtotal = Number.parseFloat(product.effective_price) * quantity
                const nextTier = nextDiscountTier(subtotal)
                return nextTier ? (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-gold-600">
                    <Sparkles size={13} />
                    Add {formatCurrency(nextTier.threshold - subtotal)} more to unlock {nextTier.percentage}% off!
                  </p>
                ) : (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
                    <Sparkles size={13} />
                    You've unlocked the maximum discount on this order!
                  </p>
                )
              })()}
            </>
          )}

          {product.ingredients && (
            <div className="mt-10 border-t border-beige-200 pt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-chocolate-900/70">
                Ingredients
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.ingredients.split(',').map((ingredient) => (
                  <span
                    key={ingredient}
                    className="rounded-full border border-beige-300 bg-cream-50 px-3 py-1.5 text-xs text-ink-900/70"
                  >
                    {ingredient.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
