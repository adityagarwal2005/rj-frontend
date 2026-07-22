import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Leaf, Minus, Plus, Sparkles, Truck, Wand2 } from 'lucide-react'
import { productService } from '@/services/productService'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import type { ProductListItem } from '@/types/product'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Button, buttonClasses } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { TurbanIcon } from '@/components/ui/TurbanIcon'
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid'

const VALUE_PROPS = [
  {
    icon: Wand2,
    title: 'Handcrafted Fusion',
    description: 'Rajasthani-inspired flavors folded into premium chocolate, handcrafted in small batches.',
  },
  {
    icon: Sparkles,
    title: 'Premium Ingredients',
    description: 'Fine Belgian-style chocolate and generous fillings — no shortcuts, ever.',
  },
  {
    icon: Truck,
    title: 'Fresh to Your Door',
    description: 'Made fresh to order and shipped with care, so it arrives exactly as it left the kitchen.',
  },
]

export function HomePage() {
  useDocumentTitle('Home')
  const [featured, setFeatured] = useState<ProductListItem[] | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let isMounted = true
    productService
      .list({ is_featured: true, page_size: 3 })
      .then((data) => {
        if (isMounted) setFeatured(data.results)
      })
      .catch(() => {
        if (isMounted) setFeatured([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  const heroProduct = featured?.[0] ?? null

  async function handleAddToCart() {
    if (!heroProduct) return
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart.', 'info')
      navigate(ROUTES.login, { state: { from: location } })
      return
    }
    setIsAdding(true)
    try {
      await addItem(heroProduct.id, quantity)
      showToast(`${heroProduct.name} added to cart.`, 'success')
      setQuantity(1)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not add item to cart.', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div>
      {/* Shoppable hero: the product itself is the first thing visible, with
          a working Add to Cart right here - no click-through required just
          to see or buy the one thing this store sells. */}
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 text-cream-50">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        <Container className="grid items-center gap-10 py-8 sm:py-10 lg:grid-cols-2 lg:gap-14 lg:py-16">
          {/* Product column: order-1 so it's the first thing seen on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2"
          >
            <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
              <div className="pointer-events-none absolute -inset-6 bg-hero-glow blur-2xl" aria-hidden="true" />
              <Link
                to={heroProduct ? ROUTES.productDetail(heroProduct.slug) : '#'}
                className="relative block overflow-hidden rounded-[28px] ring-1 ring-gold-400/20 shadow-luxury-lg"
              >
                {heroProduct?.primary_image ? (
                  <img
                    src={heroProduct.primary_image}
                    alt={heroProduct.name}
                    className="aspect-square w-full object-cover sm:aspect-[4/5]"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-chocolate-900 to-chocolate-800 sm:aspect-[4/5]">
                    <TurbanIcon className="h-16 w-16 text-gold-400/40" aria-hidden="true" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate-950/30 via-transparent to-transparent" />
              </Link>
            </div>

            {/* Purchase block - directly under the image, always visible with it */}
            <div className="mx-auto mt-5 flex w-full max-w-xs flex-col gap-4 sm:max-w-sm">
              {heroProduct ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={ROUTES.productDetail(heroProduct.slug)}
                        className="font-serif text-xl text-cream-50 hover:text-gold-300 sm:text-2xl"
                      >
                        {heroProduct.name}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-serif text-lg text-gold-300">
                          {formatCurrency(heroProduct.effective_price)}
                        </span>
                        <Badge tone="gold">{heroProduct.weight_label}</Badge>
                      </div>
                    </div>
                    {!heroProduct.in_stock && <Badge tone="danger">Out of stock</Badge>}
                  </div>

                  {heroProduct.in_stock && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-cream-50/20">
                        <button
                          type="button"
                          onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}
                          aria-label="Decrease quantity"
                          className="p-3 text-cream-50 hover:text-gold-300"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="w-7 text-center text-sm font-medium text-cream-50">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity((qty) => qty + 1)}
                          aria-label="Increase quantity"
                          className="p-3 text-cream-50 hover:text-gold-300"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      <Button variant="gold" size="lg" className="flex-1" isLoading={isAdding} onClick={handleAddToCart}>
                        Add to Cart
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-14 animate-pulse rounded-full bg-cream-50/10" />
              )}
            </div>
          </motion.div>

          {/* Text column: order-2 on mobile (below the product), left column on desktop */}
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-400"
            >
              <span className="h-px w-8 bg-gold-400/60" />
              Premium Rajasthani Chocolate
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 max-w-xl font-serif text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-6xl"
            >
              Chocolate <span className="italic text-gradient-gold">Fit for Royalty</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-cream-50/60 lg:justify-start"
            >
              <span className="flex items-center gap-1.5">
                <Leaf size={13} className="text-gold-400" /> Handcrafted, no shortcuts
              </span>
              <span className="flex items-center gap-1.5">
                <Truck size={13} className="text-gold-400" /> Same-day across Jaipur
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 flex flex-col items-center gap-3 sm:flex-row"
            >
              <Link to={ROUTES.products} className={buttonClasses('outline-light', 'md')}>
                Shop Our Collection
              </Link>
              <Link to={ROUTES.about} className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-50/60 hover:text-gold-300">
                Our Story
              </Link>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="border-b border-beige-200 py-20 sm:py-28">
        <Container>
          <div className="grid gap-14 sm:grid-cols-3 sm:gap-8">
            {VALUE_PROPS.map(({ icon: Icon, title, description }, index) => (
              <RevealOnScroll key={title} delay={index * 0.12}>
                <div className="flex flex-col items-center gap-4 text-center sm:border-l sm:border-beige-200 sm:px-6 sm:first:border-l-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400/40 bg-gold-400/10">
                    <Icon size={24} className="text-gold-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl text-chocolate-950">{title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-ink-900/65">{description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-chocolate-950 py-20 text-center text-cream-50 sm:py-28">
        <Container className="max-w-3xl">
          <RevealOnScroll>
            <p className="font-serif text-2xl italic leading-relaxed text-cream-50/90 sm:text-4xl">
              &ldquo;Where Rajasthan&rsquo;s royal heritage meets the craft of fine chocolate.&rdquo;
            </p>
            <span className="mt-6 inline-block h-px w-16 bg-gold-400/60" />
          </RevealOnScroll>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <div className="mb-12 flex flex-col items-center gap-2 text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
                Handpicked
              </span>
              <h2 className="font-serif text-4xl text-chocolate-950">Featured Chocolates</h2>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            {featured === null ? (
              <ProductGridSkeleton count={3} />
            ) : featured.length > 0 ? (
              <ProductGrid products={featured} />
            ) : (
              <p className="text-center text-sm text-ink-900/60">More chocolates are on their way — check back soon.</p>
            )}
          </RevealOnScroll>

          <div className="mt-12 flex justify-center">
            <Link
              to={ROUTES.products}
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-chocolate-900 hover:text-gold-600"
            >
              View Full Collection
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}
