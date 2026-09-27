import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Banknote,
  ChevronDown,
  Crown,
  Flame,
  Gem,
  HandHeart,
  Minus,
  Plus,
  Quote,
  ShieldCheck,
  Sparkles,
  Truck,
  Wand2,
} from 'lucide-react'
import { productService } from '@/services/productService'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { ApiError } from '@/services/apiError'
import type { ProductListItem } from '@/types/product'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { nextReachableTier } from '@/utils/discountTiers'
import { unitPriceForQuantity } from '@/utils/productPricing'
import { isLowStock } from '@/utils/stockUrgency'
import { trackEvent } from '@/utils/analytics'
import { cn } from '@/utils/cn'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pageMeta } from '@/constants/pageMeta'
import { useStructuredData } from '@/hooks/useStructuredData'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { Container } from '@/components/ui/Container'
import { Button, buttonClasses } from '@/components/ui/Button'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TurbanIcon } from '@/components/ui/TurbanIcon'
import { HawaMahalSilhouette } from '@/components/ui/HawaMahalSilhouette'
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid'
import { PromoTiles } from '@/components/product/PromoTiles'
import { RecentlyViewedStrip } from '@/components/product/RecentlyViewedStrip'

const EASE = [0.22, 1, 0.36, 1] as const

// The hero rotates through the whole range, one product every couple of
// seconds, so the first screen shows everything on sale rather than one bar.
const SHOWCASE_INTERVAL_MS = 2000

// The flavour ticker under the hero. One marquee, transform-only, and the
// section it lives in is content-visibility gated - this is the only
// permanently running animation on the page.
const FLAVOURS = ['Kunafa', 'Biscoff', 'Kesar', 'Pistachio', 'Kataifi', 'Gulkand', 'Cardamom', 'White Chocolate']

const TRUST_POINTS = [
  { icon: HandHeart, title: 'Handmade in Jaipur', detail: 'Tempered by hand in Bani Park' },
  { icon: Truck, title: 'Same-day delivery', detail: 'Anywhere in Jaipur' },
  { icon: ShieldCheck, title: 'Secure payments', detail: 'UPI, cards & wallets via Razorpay' },
  { icon: Banknote, title: 'Cash on delivery', detail: 'Pay at your door if you prefer' },
]

const HERITAGE_PILLARS = [
  {
    icon: Crown,
    kicker: 'Royal Recipes',
    title: 'From the Palace Kitchen',
    description: 'Kunafa, kesar, gulkand, saffron — the flavors that once perfumed royal thalis, rebuilt in fine chocolate.',
  },
  {
    icon: Gem,
    kicker: 'Jaipur Craft',
    title: 'Handmade in the Pink City',
    description: 'Every bar is tempered, filled and finished by hand in our Bani Park kitchen — not on a line, not overseas.',
  },
  {
    icon: Flame,
    kicker: 'Small Batch',
    title: 'Fresh, Never Stockpiled',
    description: 'Made the day it ships. If we run out, we run out. Freshness matters more than shelf-life.',
  },
]

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

const TESTIMONIALS = [
  {
    quote: 'The kunafa filling is unreal — tastes like it came straight from a Dubai chocolatier, but made right here in Jaipur.',
    name: 'Ananya S.',
    location: 'Malviya Nagar, Jaipur',
  },
  {
    quote: 'Ordered on WhatsApp, paid via UPI, chocolate showed up same day. Smoothest small-batch order I have placed.',
    name: 'Rohit K.',
    location: 'Vaishali Nagar, Jaipur',
  },
  {
    quote: 'Gifted a box for Diwali and everyone asked where it was from. Rich, generous filling, not overly sweet.',
    name: 'Priya M.',
    location: 'C-Scheme, Jaipur',
  },
]

// Also emitted as FAQPage structured data (see useStructuredData below), so
// these answers are written to stand on their own in a search result, not
// just in the context of the page.
const FAQS = [
  {
    question: 'What chocolates do you make?',
    answer:
      'Handmade chocolate bars and lollipops, made in small batches in Jaipur. The range includes Kunafa Chocolate, filled with pistachio kunafa spread and crunchy roasted kataifi, and Biscoff Chocolate, creamy white chocolate with Biscoff cookie butter, plus Kunafa and Biscoff lollipops, with more flavors on the way.',
  },
  {
    question: 'What makes it Rajasthani chocolate?',
    answer:
      'We build our chocolates around the flavors of a Rajasthani royal kitchen — kesar, pistachio, gulkand and cardamom — using fine Belgian-style couverture. It is not a mithai box and not a plain chocolate bar, but a fusion of the two.',
  },
  {
    question: 'Which areas of Jaipur do you deliver to?',
    answer:
      'We deliver across Jaipur, including Bani Park, C-Scheme, Malviya Nagar, Vaishali Nagar, Mansarovar, Raja Park and Jagatpura. Orders placed before the evening cut-off usually arrive the same day.',
  },
  {
    question: 'How do I place an order?',
    answer:
      'Add the chocolate to your cart and pay online by UPI, card or wallet, or tap "Order on WhatsApp" to share your address and pay directly with us on chat — whichever is easier for you.',
  },
  {
    question: 'Do you deliver outside Jaipur?',
    answer:
      'Right now we deliver only within Jaipur to guarantee same-day freshness. We are working on expanding — follow our WhatsApp for updates.',
  },
  {
    question: 'How fresh is the chocolate?',
    answer: 'Every order is made fresh in small batches after it is placed, not pulled from a stockpile shelf.',
  },
  {
    question: 'Can I order chocolate as a gift in Jaipur?',
    answer:
      'Yes. Tick "This is a gift" at checkout and we leave the price out of the package and include your message instead. Rakhi, Diwali and birthday gift orders are welcome — message us on WhatsApp for larger gift boxes.',
  },
  {
    question: 'Is payment safe?',
    answer:
      'Yes — online payments are handled by Razorpay, so your card and UPI details never touch our servers. Cash on delivery is also available for a small handling fee.',
  },
]

export function HomePage() {
  useDocumentTitle(pageMeta('/').title, {
    description: pageMeta('/').description,
    canonicalPath: '/',
  })

  // FAQPage schema off the same FAQS array rendered below - Google shows
  // these as an expandable Q&A block under the result, which takes up more
  // space on the page and lifts click-through. Answers must match the
  // visible text exactly or the rich result is disallowed.
  useStructuredData('faq-structured-data', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  })
  const [products, setProducts] = useState<ProductListItem[] | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showcaseIndex, setShowcaseIndex] = useState(0)
  // The buy card below the photo belongs to whichever product is showing, so
  // the rotation has to stop the moment someone reaches for it - otherwise it
  // could flip to the next product between aiming at "Add to Cart" and
  // tapping it, and put the wrong chocolate in their cart.
  const [isShowcasePaused, setIsShowcasePaused] = useState(false)
  const recentlyViewed = useRecentlyViewed()

  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // One call covers both the hero rotation and the grid below it, so the two
  // can never disagree about what is in the catalog.
  useEffect(() => {
    let isMounted = true
    productService
      .list({ page_size: 12 })
      .then((data) => {
        if (isMounted) setProducts(data.results)
      })
      .catch(() => {
        if (isMounted) setProducts([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  const showcase = products ?? []
  const activeProduct = showcase[showcaseIndex] ?? null
  const featured =
    products === null ? null : products.filter((item) => item.is_featured).length > 0
      ? products.filter((item) => item.is_featured)
      : products.slice(0, 3)

  useEffect(() => {
    if (showcase.length < 2 || isShowcasePaused) return
    // An auto-advancing carousel is exactly what someone who asked for less
    // motion does not want; they can still step through it with the dots.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      setShowcaseIndex((index) => (index + 1) % showcase.length)
      setQuantity(1)
    }, SHOWCASE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [showcase.length, isShowcasePaused])

  function selectShowcase(index: number) {
    setShowcaseIndex(index)
    setQuantity(1)
    setIsShowcasePaused(true)
  }

  async function handleAddToCart() {
    // Read the product off the card the shopper is actually looking at, and
    // freeze the rotation before the await so it cannot advance mid-request.
    const product = activeProduct
    if (!product) return
    setIsShowcasePaused(true)
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
      setQuantity(1)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not add item to cart.', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  const heroSubtotal = activeProduct ? unitPriceForQuantity(activeProduct, quantity) * quantity : 0
  const heroNextTier = activeProduct ? nextReachableTier(heroSubtotal) : null
  const craftImage = showcase[1]?.primary_image ?? showcase[0]?.primary_image ?? null

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="bg-grain relative overflow-hidden bg-chocolate-950 text-cream-50">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.05]" aria-hidden="true" />
        <div className="bg-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />

        <Container className="relative grid items-center gap-y-10 pb-14 pt-10 sm:pb-20 sm:pt-14 lg:min-h-[86vh] lg:grid-cols-[1.02fr_0.98fr] lg:gap-x-16 lg:py-24">
          {/* ---- copy ---- */}
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="eyebrow flex items-center gap-3 text-gold-400"
            >
              <span className="h-px w-8 bg-gold-400/60" aria-hidden="true" />
              Padharo — a taste of Rajasthan
              <span className="h-px w-8 bg-gold-400/60 lg:hidden" aria-hidden="true" />
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.05, ease: EASE }}
              className="mt-6 font-display text-[54px] font-medium leading-[0.92] tracking-[-0.025em] sm:text-[76px] lg:text-[92px] xl:text-[104px]"
            >
              Chocolate
              <span className="mt-1 block italic text-foil">Fit for Royalty</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-7 flex max-w-md flex-col items-center gap-5 lg:items-start"
            >
              <div className="hairline-gold w-28" aria-hidden="true" />
              <p className="text-[15px] leading-relaxed text-cream-50/70 sm:text-[17px]">
                A small Jaipur kitchen making chocolate by hand, in small batches — kunafa, Biscoff,
                kesar and more — and delivered to your door the day it&rsquo;s made.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: EASE }}
              className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            >
              <Link to={ROUTES.products} className={buttonClasses('gold', 'lg', 'shine')}>
                Shop the Collection <ArrowRight size={16} />
              </Link>
              <Link to={ROUTES.about} className={buttonClasses('outline-light', 'lg')}>
                Our Story
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="mt-10 hidden items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cream-50/40 lg:flex"
            >
              <ChevronDown size={14} className="animate-bounce text-gold-400/80" aria-hidden="true" />
              Scroll to explore
            </motion.div>
          </div>

          {/* ---- arch-framed photography + floating buy card ---- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
            className="relative order-1 mx-auto w-full max-w-[420px] lg:order-2 lg:max-w-none"
            // pointerdown fires on the way down of the very same tap that
            // becomes the click, so the product is already frozen by the time
            // "Add to Cart" runs. Hover handles the desktop case, but a phone
            // has no hover at all - without this, the card could swap under a
            // finger already on its way to the button.
            onPointerDown={() => setIsShowcasePaused(true)}
            onPointerEnter={() => setIsShowcasePaused(true)}
            onPointerLeave={(event) => {
              // Leaving with a finger still down is the tail of a tap, not a
              // mouse moving away; keep it paused in that case.
              if (event.pointerType === 'mouse') setIsShowcasePaused(false)
            }}
            onFocusCapture={() => setIsShowcasePaused(true)}
          >
            {/* offset gold outline, echoing a jharokha window frame */}
            <div
              className="pointer-events-none absolute -inset-3 rounded-t-[999px] rounded-b-[32px] border border-gold-400/25 sm:-inset-4"
              aria-hidden="true"
            />
            <span
              className="absolute left-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-[calc(50%+12px)] rotate-45 bg-gold-400 sm:-translate-y-[calc(50%+16px)]"
              aria-hidden="true"
            />

            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[999px] rounded-b-[26px] bg-chocolate-900 shadow-arch lg:aspect-[5/6]">
              {showcase.length > 0 ? (
                showcase.map((item, index) =>
                  item.primary_image ? (
                    <img
                      key={item.id}
                      src={item.primary_image}
                      alt={index === showcaseIndex ? item.name : ''}
                      aria-hidden={index !== showcaseIndex}
                      fetchPriority={index === 0 ? 'high' : 'low'}
                      decoding="async"
                      // The incoming photo fades in on top while the outgoing one
                      // stays fully opaque underneath and only disappears once
                      // covered. Fading both at once let the dark background
                      // show through mid-transition, dimming the photo.
                      //
                      // Kept short on purpose: the card underneath names and
                      // prices whatever is showing, so a long crossfade means
                      // the photo and the price disagree for that whole time.
                      className={cn(
                        'absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out',
                        index === showcaseIndex
                          ? 'z-[1] opacity-100 duration-[400ms]'
                          : 'z-0 opacity-0 delay-[400ms] duration-0',
                      )}
                    />
                  ) : null,
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <TurbanIcon className="h-16 w-16 text-gold-400/30" aria-hidden="true" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-chocolate-950/35 via-transparent to-transparent" />

              {showcase.length > 1 && (
                <div className="absolute inset-x-0 bottom-5 z-[3] flex justify-center gap-1.5">
                  {showcase.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectShowcase(index)}
                      aria-label={`Show ${item.name}`}
                      aria-current={index === showcaseIndex}
                      className={cn(
                        'h-1 rounded-full transition-all duration-500',
                        index === showcaseIndex ? 'w-6 bg-gold-300' : 'w-1.5 bg-cream-50/45 hover:bg-cream-50/70',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* floating buy card - overlaps the photo so the hero reads as
                layered depth rather than two flat columns */}
            <div className="relative z-[4] mx-auto -mt-10 w-[92%] rounded-[22px] border border-cream-50/12 bg-chocolate-950/92 p-5 shadow-luxury-lg sm:w-[86%] lg:-mt-14 lg:ml-0 lg:w-[78%]">
              {activeProduct ? (
                // Keyed so the card's details re-mount and fade with each
                // product, in step with the photo above rather than snapping
                // to the next name while the old photo is still on screen.
                <div key={activeProduct.id} className="page-in">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="eyebrow text-[10px] text-gold-400">
                        {activeProduct.is_featured ? 'Signature' : activeProduct.category} &middot; {activeProduct.weight_label}
                      </p>
                      <Link
                        to={ROUTES.productDetail(activeProduct.slug)}
                        className="mt-1.5 block font-display text-[26px] leading-tight text-cream-50 transition-colors hover:text-gold-300 sm:text-[30px]"
                      >
                        {activeProduct.name}
                      </Link>
                      {activeProduct.bulk_price && activeProduct.bulk_min_quantity && (
                        <p className="mt-1 text-xs text-gold-300/80">
                          Buy {activeProduct.bulk_min_quantity}+ for {formatCurrency(activeProduct.bulk_price)} each
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-[26px] font-semibold leading-none tabular-nums text-foil">
                        {formatCurrency(unitPriceForQuantity(activeProduct, quantity))}
                      </p>
                      {activeProduct.in_stock && isLowStock(activeProduct.stock_quantity) && (
                        <p className="mt-1.5 text-[11px] font-medium text-jaipur-300">
                          Only {activeProduct.stock_quantity} left
                        </p>
                      )}
                    </div>
                  </div>

                  {activeProduct.in_stock ? (
                    <>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="flex h-14 items-center rounded-full border border-cream-50/20">
                          <button
                            type="button"
                            onClick={() => {
                              setIsShowcasePaused(true)
                              setQuantity((qty) => Math.max(1, qty - 1))
                            }}
                            aria-label="Decrease quantity"
                            className="flex h-full w-11 items-center justify-center text-cream-50/80 transition-colors hover:text-gold-300"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium tabular-nums">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsShowcasePaused(true)
                              setQuantity((qty) => Math.min(activeProduct.stock_quantity, qty + 1))
                            }}
                            aria-label="Increase quantity"
                            className="flex h-full w-11 items-center justify-center text-cream-50/80 transition-colors hover:text-gold-300"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                        <Button variant="gold" size="lg" className="shine flex-1 px-4" isLoading={isAdding} onClick={handleAddToCart}>
                          Add to Cart
                        </Button>
                      </div>
                      <p
                        className={cn(
                          'mt-3.5 flex items-center gap-1.5 text-xs',
                          heroNextTier ? 'text-cream-50/60' : 'text-emerald-300',
                        )}
                      >
                        <Sparkles size={13} className={heroNextTier ? 'text-gold-400' : undefined} />
                        {heroNextTier
                          ? `Add ${formatCurrency(heroNextTier.threshold - heroSubtotal)} more to unlock ${heroNextTier.percentage}% off`
                          : 'You’ve unlocked the maximum discount!'}
                      </p>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-cream-50/60">Sold out for today — a fresh batch is on its way.</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3" aria-hidden="true">
                  <div className="h-3 w-24 rounded-full bg-cream-50/10" />
                  <div className="h-7 w-2/3 rounded-full bg-cream-50/10" />
                  <div className="mt-2 h-14 rounded-full bg-cream-50/10" />
                </div>
              )}
            </div>
          </motion.div>
        </Container>

        <HawaMahalSilhouette
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-gold-300/[0.10] [mask-image:linear-gradient(to_top,black_35%,transparent)] sm:h-24 lg:h-28"
          aria-hidden="true"
        />
      </section>

      {/* ================= FLAVOUR TICKER ================= */}
      <section className="relative overflow-hidden border-y border-gold-400/20 bg-chocolate-900 py-3.5">
        <div className="marquee-track">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center gap-8 px-4" aria-hidden={half === 1}>
              {FLAVOURS.map((flavour) => (
                <span key={`${half}-${flavour}`} className="flex items-center gap-8">
                  <span className="font-display text-[19px] italic text-cream-50/70 sm:text-[22px]">{flavour}</span>
                  <span className="text-[7px] text-gold-500/70" aria-hidden="true">
                    ◆
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="border-b border-beige-200 bg-cream-50">
        <Container className="grid grid-cols-2 gap-x-4 gap-y-6 py-8 sm:py-10 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-beige-200">
          {TRUST_POINTS.map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex flex-col items-center gap-2.5 text-center sm:flex-row sm:text-left lg:justify-center lg:px-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-400/40 text-gold-600">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-chocolate-950">{title}</p>
                <p className="mt-0.5 text-xs leading-snug text-ink-900/50">{detail}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Handpicked"
            title="Featured Chocolates"
            description="Our signature bars and lollipops, made the day they ship."
            action={
              <Link
                to={ROUTES.products}
                className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chocolate-950"
              >
                View Full Collection
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            }
          />

          {featured === null ? (
            <ProductGridSkeleton count={3} />
          ) : featured.length > 0 ? (
            <ProductGrid products={featured} />
          ) : (
            <p className="text-center text-sm text-ink-900/60">More chocolates are on their way — check back soon.</p>
          )}
        </Container>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="defer-paint pb-20">
          <Container>
            <RecentlyViewedStrip />
          </Container>
        </section>
      )}

      {/* ================= CRAFT (image + numbered steps) ================= */}
      <section className="defer-paint bg-heritage-glow border-y border-beige-200 py-20 sm:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <RevealOnScroll>
              <div className="relative mx-auto w-full max-w-[420px]">
                <div
                  className="pointer-events-none absolute -inset-3 rounded-t-[999px] rounded-b-[28px] border border-gold-400/30"
                  aria-hidden="true"
                />
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[22px] bg-beige-200 shadow-luxury">
                  {craftImage ? (
                    <img src={craftImage} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <TurbanIcon className="h-14 w-14 text-gold-500/30" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>
            </RevealOnScroll>

            <div>
              <RevealOnScroll>
                <SectionHeading
                  align="left"
                  eyebrow="Our Craft"
                  title="From Kitchen to Your Door"
                  className="mb-8 sm:mb-10"
                />
              </RevealOnScroll>

              <div className="flex flex-col divide-y divide-beige-200 border-y border-beige-200">
                {VALUE_PROPS.map(({ icon: Icon, title, description }, index) => (
                  <RevealOnScroll key={title} delay={index * 0.08}>
                    <div className="flex items-start gap-5 py-6">
                      <span className="font-display text-[34px] italic leading-none text-beige-300" aria-hidden="true">
                        0{index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="flex items-center gap-2.5 font-display text-[26px] leading-tight text-chocolate-950">
                          <Icon size={18} strokeWidth={1.6} className="shrink-0 text-gold-600" />
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-900/60">{description}</p>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================= HERITAGE (dark band) ================= */}
      <section className="bg-grain defer-paint relative overflow-hidden bg-chocolate-950 py-20 text-cream-50 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.04]" aria-hidden="true" />
        <Container className="relative">
          <RevealOnScroll>
            <SectionHeading
              tone="dark"
              eyebrow="A Rajwadi Heritage"
              title={
                <>
                  Where a <span className="italic text-foil">Palace Recipe</span> Meets a Cocoa Bean
                </>
              }
              description="Rajasthan’s royal thalis balanced richness with restraint — heavy in ghee and saffron, but never overpowering. We build our chocolates the same way."
            />
          </RevealOnScroll>

          <div className="grid gap-px overflow-hidden rounded-[26px] border border-cream-50/10 bg-cream-50/10 sm:grid-cols-3">
            {HERITAGE_PILLARS.map(({ icon: Icon, kicker, title, description }, index) => (
              <RevealOnScroll key={title} delay={index * 0.08} className="h-full">
                <div className="flex h-full flex-col gap-4 bg-chocolate-950 p-7 sm:p-9">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/40 text-gold-300">
                      <Icon size={20} strokeWidth={1.5} />
                    </span>
                    <span className="font-display text-4xl italic text-cream-50/12" aria-hidden="true">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="eyebrow mt-2 text-[10px] text-jaipur-300">{kicker}</p>
                  <h3 className="font-display text-[28px] leading-tight text-cream-50">{title}</h3>
                  <p className="text-sm leading-relaxed text-cream-50/60">{description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll delay={0.1}>
            <figure className="mx-auto mt-20 max-w-3xl text-center">
              <Quote size={28} strokeWidth={1.3} className="mx-auto text-gold-500" aria-hidden="true" />
              <blockquote className="mt-6 font-display text-[30px] italic leading-[1.22] sm:text-[44px]">
                Where Rajasthan&rsquo;s royal heritage meets the craft of fine chocolate.
              </blockquote>
              <div className="hairline-gold mx-auto mt-8 w-40" aria-hidden="true" />
              <figcaption className="eyebrow mt-6 text-gold-400">The RajwadiTukda Kitchen &middot; Bani Park</figcaption>
            </figure>
          </RevealOnScroll>
        </Container>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="defer-paint border-b border-beige-200 bg-cream-100/60 py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <SectionHeading eyebrow="Loved in Jaipur" title="Voices from the Pink City" />
          </RevealOnScroll>

          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <RevealOnScroll key={testimonial.name} delay={index * 0.08} className="h-full">
                <figure className="lift flex h-full flex-col rounded-[22px] border border-beige-200 bg-white p-7 shadow-soft hover:border-gold-400/50 hover:shadow-luxury">
                  <Quote size={22} strokeWidth={1.4} className="text-gold-500" aria-hidden="true" />
                  <blockquote className="mt-4 flex-1 font-display text-[21px] leading-snug text-chocolate-950">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-beige-200 pt-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chocolate-950 font-display text-lg text-gold-300">
                      {testimonial.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-chocolate-950">{testimonial.name}</span>
                      <span className="block text-xs text-ink-900/50">{testimonial.location}</span>
                    </span>
                  </figcaption>
                </figure>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* ================= OFFERS ================= */}
      <section className="defer-paint py-20 sm:py-24">
        <Container>
          <RevealOnScroll>
            <SectionHeading align="left" eyebrow="Sweet Deals" title="Save More, Automatically" />
          </RevealOnScroll>
          <PromoTiles />
        </Container>
      </section>

      {/* ================= FAQ ================= */}
      <section className="defer-paint border-t border-beige-200 py-20 sm:py-28">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Questions" title="Frequently Asked" />

          <div className="divide-y divide-beige-200 border-y border-beige-200">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-[21px] leading-snug text-chocolate-950 transition-colors marker:content-none hover:text-gold-700 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-beige-300 text-gold-600 transition-all duration-300 group-open:rotate-45 group-open:border-gold-400 group-open:bg-gold-400/10">
                    <Plus size={15} />
                  </span>
                </summary>
                <p className="pb-6 pr-12 text-[15px] leading-relaxed text-ink-900/65">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </div>
  )
}
