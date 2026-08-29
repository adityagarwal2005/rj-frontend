import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Crown, Flame, Gem, Leaf, Minus, Plus, Quote, ShieldCheck, Sparkles, Truck, Wand2 } from 'lucide-react'
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
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pageMeta } from '@/constants/pageMeta'
import { useStructuredData } from '@/hooks/useStructuredData'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { Container } from '@/components/ui/Container'
import { Button, buttonClasses } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { TurbanIcon } from '@/components/ui/TurbanIcon'
import { HawaMahalSilhouette } from '@/components/ui/HawaMahalSilhouette'
import { JharokhaArch } from '@/components/ui/JharokhaArch'
import { PaisleyDivider } from '@/components/ui/PaisleyDivider'
import { PeacockFeather } from '@/components/ui/PeacockFeather'
import { LotusOrnament } from '@/components/ui/LotusOrnament'
import { RangoliCorner } from '@/components/ui/RangoliCorner'
import { ProductGrid, ProductGridSkeleton } from '@/components/product/ProductGrid'
import { PromoTiles } from '@/components/product/PromoTiles'
import { RecentlyViewedStrip } from '@/components/product/RecentlyViewedStrip'

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
    question: 'What is Kunafa chocolate?',
    answer:
      'Kunafa chocolate is a thick chocolate bar filled with pistachio kunafa spread and crunchy roasted kataifi pastry. Ours is hand-tempered in Jaipur in small batches, so the kataifi stays crisp against the smooth chocolate shell.',
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
  const [featured, setFeatured] = useState<ProductListItem[] | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [heroImageIndex, setHeroImageIndex] = useState(0)
  const recentlyViewed = useRecentlyViewed()

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

  useEffect(() => {
    if (!heroProduct?.slug) return
    let isMounted = true
    productService
      .getBySlug(heroProduct.slug)
      .then((detail) => {
        if (!isMounted) return
        const urls = [...detail.images].sort((a, b) => a.display_order - b.display_order).map((img) => img.image)
        setHeroImages(urls.length > 0 ? urls : heroProduct.primary_image ? [heroProduct.primary_image] : [])
      })
      .catch(() => {
        if (isMounted && heroProduct.primary_image) setHeroImages([heroProduct.primary_image])
      })
    return () => {
      isMounted = false
    }
  }, [heroProduct?.slug])

  useEffect(() => {
    if (heroImages.length < 2) return
    const id = setInterval(() => {
      setHeroImageIndex((i) => (i + 1) % heroImages.length)
    }, 1800)
    return () => clearInterval(id)
  }, [heroImages.length])

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
      trackEvent('add_to_cart', { item_id: heroProduct.id, item_name: heroProduct.name, quantity })
      setQuantity(1)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not add item to cart.', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div>
      {/* HERO — a jharokha arch frames the product, paisley pattern washes
          the backdrop at low opacity, a peacock feather drifts on the
          left, and the display title uses the Cormorant serif for a
          more editorial/palace feel. */}
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 text-cream-50">
        {/* Buta/paisley pattern wash - very faint gold trellis */}
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.07]" aria-hidden="true" />

        {/* Hawa Mahal silhouette along the bottom */}
        <HawaMahalSilhouette
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-gold-300/25 [mask-image:linear-gradient(to_top,black_55%,transparent)] sm:h-32 lg:h-40"
          aria-hidden="true"
        />

        {/* Floating peacock feather - left side, hidden on small screens */}
        <PeacockFeather
          className="pointer-events-none absolute -left-6 top-24 hidden h-52 w-auto text-gold-400/25 lg:block float-slow"
          aria-hidden="true"
        />
        <PeacockFeather
          className="pointer-events-none absolute -right-8 top-40 hidden h-40 w-auto -scale-x-100 text-jaipur-500/25 xl:block drift-slow"
          aria-hidden="true"
        />

        {/* Corner rangoli ornaments */}
        <RangoliCorner className="pointer-events-none absolute left-0 top-0 h-28 w-28 text-gold-400/25" aria-hidden="true" />
        <RangoliCorner className="pointer-events-none absolute right-0 top-0 h-28 w-28 -scale-x-100 text-gold-400/25" aria-hidden="true" />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

        <Container className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:py-20">
          {/* Product column: order-1 so it's the first thing seen on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2"
          >
            {/* Arch-framed hero image - the JharokhaArch sits behind the
                product photo, drawn in gold hairline. The photo itself
                lives inside the arch's mouth. */}
            <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg">
              <JharokhaArch
                className="pointer-events-none absolute -inset-x-6 -top-6 bottom-8 h-auto w-[calc(100%+3rem)] text-gold-400/35"
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute -inset-6 bg-hero-glow blur-2xl" aria-hidden="true" />
              <Link
                to={heroProduct ? ROUTES.productDetail(heroProduct.slug) : '#'}
                className="relative block overflow-hidden rounded-t-[160px] rounded-b-[28px] ring-1 ring-gold-400/40 shadow-arch"
              >
                {heroImages.length > 0 ? (
                  <div className="relative aspect-[7/8] w-full overflow-hidden">
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={heroImages[heroImageIndex]}
                        src={heroImages[heroImageIndex]}
                        alt={heroProduct?.name ?? ''}
                        initial={{ x: '100%', opacity: 0.6 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0.6 }}
                        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </AnimatePresence>
                    {heroImages.length > 1 && (
                      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                        {heroImages.map((src, i) => (
                          <span
                            key={src}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === heroImageIndex ? 'w-4 bg-gold-300' : 'w-1.5 bg-cream-50/40'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-[7/8] w-full items-center justify-center bg-gradient-to-br from-chocolate-900 to-chocolate-800">
                    <TurbanIcon className="h-16 w-16 text-gold-400/40" aria-hidden="true" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate-950/30 via-transparent to-transparent" />
              </Link>
            </div>

            {/* Purchase block */}
            <div className="mx-auto mt-6 flex w-full max-w-sm flex-col gap-4 sm:max-w-md lg:max-w-lg">
              {heroProduct ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1.5 flex items-center gap-2">
                        <Badge tone="gold">Rakhi Special</Badge>
                        <span className="font-script text-sm text-gold-300/90">chef&rsquo;s pick</span>
                      </div>
                      <Link
                        to={ROUTES.productDetail(heroProduct.slug)}
                        className="block font-display text-2xl font-semibold text-cream-50 hover:text-gold-300 sm:text-3xl"
                      >
                        {heroProduct.name}
                      </Link>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="font-serif text-xl text-gold-300">
                          {formatCurrency(unitPriceForQuantity(heroProduct, quantity))}
                        </span>
                        <Badge tone="gold">{heroProduct.weight_label}</Badge>
                        {heroProduct.in_stock && isLowStock(heroProduct.stock_quantity) && (
                          <Badge tone="danger">Only {heroProduct.stock_quantity} left</Badge>
                        )}
                      </div>
                      {heroProduct.bulk_price && heroProduct.bulk_min_quantity && (
                        <p className="mt-1 text-xs font-medium text-gold-300/90">
                          Buy {heroProduct.bulk_min_quantity}+ for {formatCurrency(heroProduct.bulk_price)} each
                        </p>
                      )}
                    </div>
                    {!heroProduct.in_stock && <Badge tone="danger">Out of stock</Badge>}
                  </div>

                  {heroProduct.in_stock && (
                    <>
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

                      {(() => {
                        const subtotal = unitPriceForQuantity(heroProduct, quantity) * quantity
                        const nextTier = nextReachableTier(subtotal)
                        return nextTier ? (
                          <p className="flex items-center gap-1.5 text-xs text-gold-300">
                            <Sparkles size={13} />
                            Add {formatCurrency(nextTier.threshold - subtotal)} more to unlock {nextTier.percentage}% off!
                          </p>
                        ) : (
                          <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                            <Sparkles size={13} />
                            You&rsquo;ve unlocked the maximum discount!
                          </p>
                        )
                      })()}
                    </>
                  )}
                </>
              ) : (
                <div className="h-14 animate-pulse rounded-full bg-cream-50/10" />
              )}
            </div>
          </motion.div>

          {/* Text column */}
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-gold-400"
            >
              <span className="h-px w-8 bg-gold-400/60" />
              Padharo — a taste of Rajasthan
              <span className="h-px w-8 bg-gold-400/60 lg:hidden" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-[68px]"
            >
              Chocolate <span className="italic text-gradient-gold">Fit for Royalty</span>
              {/* Second line inside the h1: the brand line above is memorable
                  but says nothing about what's actually sold, which is a gap
                  for both a first-time visitor and for search. */}
              <span className="mt-3 block font-sans text-sm font-medium uppercase tracking-[0.18em] text-cream-50/60 sm:text-base sm:tracking-[0.2em]">
                Handmade Kunafa Chocolate in Jaipur
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-5 max-w-md text-[15px] leading-relaxed text-cream-50/70 lg:text-base"
            >
              A small Jaipur kitchen making one chocolate at a time, hand-tempered with royal flavors
              — kunafa, kesar, kataifi — and delivered to your door the day it&rsquo;s made.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-cream-50/60 lg:justify-start"
            >
              <span className="flex items-center gap-1.5">
                <Leaf size={13} className="text-gold-400" /> Handcrafted, no shortcuts
              </span>
              <span className="flex items-center gap-1.5">
                <Truck size={13} className="text-gold-400" /> Same-day across Jaipur
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-gold-400" /> Secure prepaid checkout
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
            >
              <Link to={ROUTES.products} className={buttonClasses('gold', 'md')}>
                Shop the Collection
              </Link>
              <Link
                to={ROUTES.about}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50/70 hover:text-gold-300"
              >
                Our Story
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* HERITAGE — three pillars laid out inside jharokha-style arch
          cards. Rajasthan colors used sparingly here to make the story
          section feel distinctly local. */}
      <section className="bg-heritage-glow relative overflow-hidden border-b border-beige-200 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        <Container>
          <RevealOnScroll>
            <div className="mb-14 flex flex-col items-center gap-3 text-center">
              <LotusOrnament className="h-4 w-24 text-gold-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-600">
                A Rajwadi Heritage
              </span>
              <h2 className="max-w-2xl font-display text-4xl leading-[1.05] text-chocolate-950 sm:text-5xl">
                Where a <span className="italic text-gradient-royal">Palace Recipe</span> Meets a Cocoa Bean
              </h2>
              <p className="max-w-xl text-[15px] leading-relaxed text-ink-900/65">
                Rajasthan&rsquo;s royal thalis balanced richness with restraint — heavy in ghee and saffron,
                but never overpowering. We build our chocolates the same way.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid gap-6 sm:grid-cols-3">
            {HERITAGE_PILLARS.map(({ icon: Icon, kicker, title, description }, index) => (
              <RevealOnScroll key={title} delay={index * 0.1}>
                <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-t-[110px] rounded-b-3xl border border-gold-400/25 bg-cream-50/80 p-8 pt-14 text-center shadow-luxury transition-all duration-500 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-luxury-lg">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-jaali opacity-[0.05]" />
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/50 bg-gradient-to-br from-cream-50 to-beige-200 text-gold-600 shadow-[0_4px_12px_-4px_rgba(175,138,72,0.35)] transition-transform duration-500 group-hover:rotate-[6deg]">
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-jaipur-600">{kicker}</p>
                  <h3 className="font-display text-2xl leading-tight text-chocolate-950">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink-900/65">{description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* SWEET DEALS */}
      <section className="border-b border-beige-200 bg-gold-400/5 py-16">
        <Container>
          <RevealOnScroll>
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <LotusOrnament className="h-4 w-20 text-gold-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-600">Sweet Deals</span>
              <h2 className="font-display text-4xl text-chocolate-950 sm:text-5xl">Save More, Automatically</h2>
            </div>
          </RevealOnScroll>
          <PromoTiles />
        </Container>
      </section>

      {/* CRAFT — the three-step process, rendered as connected numbered
          medallions along a hairline gold rule. */}
      <section className="relative border-b border-beige-200 py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <div className="mb-14 flex flex-col items-center gap-3 text-center">
              <LotusOrnament className="h-4 w-24 text-gold-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-600">
                Our Craft
              </span>
              <h2 className="font-display text-4xl text-chocolate-950 sm:text-5xl">
                From Kitchen to Your Door
              </h2>
            </div>
          </RevealOnScroll>

          <div className="relative grid gap-14 sm:grid-cols-3 sm:gap-8">
            <div
              className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent sm:block"
              aria-hidden="true"
            />
            {VALUE_PROPS.map(({ icon: Icon, title, description }, index) => (
              <RevealOnScroll key={title} delay={index * 0.12}>
                <div className="relative flex flex-col items-center gap-4 text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gold-400/40 bg-cream-50 shadow-luxury">
                    <Icon size={24} className="text-gold-600" strokeWidth={1.5} />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-chocolate-950 font-serif text-xs text-gold-300">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-chocolate-950">{title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-ink-900/65">{description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* QUOTE */}
      <section className="bg-grain relative overflow-hidden bg-chocolate-950 py-20 text-center text-cream-50 sm:py-28">
        <PeacockFeather
          className="pointer-events-none absolute -left-6 top-6 hidden h-40 w-auto text-gold-400/25 md:block float-slow"
          aria-hidden="true"
        />
        <PeacockFeather
          className="pointer-events-none absolute -right-6 bottom-6 hidden h-40 w-auto -scale-x-100 text-jaipur-500/25 md:block drift-slow"
          aria-hidden="true"
        />
        <Container className="max-w-3xl">
          <RevealOnScroll>
            <p className="font-script text-3xl leading-[1.3] text-gold-300 sm:text-5xl">
              &ldquo;Where Rajasthan&rsquo;s royal heritage meets the craft of fine chocolate.&rdquo;
            </p>
            <PaisleyDivider className="mx-auto mt-8 h-4 w-64 text-gold-400/70" />
          </RevealOnScroll>
        </Container>
      </section>

      {/* FEATURED */}
      <section className="py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <div className="mb-12 flex flex-col items-center gap-3 text-center">
              <LotusOrnament className="h-4 w-24 text-gold-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-600">Handpicked</span>
              <h2 className="font-display text-4xl text-chocolate-950 sm:text-5xl">Featured Chocolates</h2>
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
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chocolate-900 hover:text-gold-600"
            >
              View Full Collection
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Container>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="py-16">
          <Container>
            <RecentlyViewedStrip />
          </Container>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="border-t border-beige-200 bg-cream-50/60 py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <div className="mb-12 flex flex-col items-center gap-3 text-center">
              <LotusOrnament className="h-4 w-24 text-gold-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-600">Loved in Jaipur</span>
              <h2 className="font-display text-4xl text-chocolate-950 sm:text-5xl">Voices from the Pink City</h2>
            </div>
          </RevealOnScroll>

          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <RevealOnScroll key={testimonial.name} delay={index * 0.1}>
                <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-[24px] border border-beige-200/80 bg-white/80 p-6 shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
                  <Quote
                    size={80}
                    className="pointer-events-none absolute -right-3 -top-3 text-gold-400/10"
                    aria-hidden="true"
                  />
                  <Quote size={20} className="relative text-gold-500" />
                  <p className="relative flex-1 font-serif text-[15px] leading-relaxed text-ink-900/80">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <PaisleyDivider className="h-3 w-24 text-gold-400/70" />
                  <div className="relative flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400/20 to-jaipur-500/10 font-serif text-sm text-gold-700 ring-1 ring-gold-400/40">
                      {testimonial.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-chocolate-950">{testimonial.name}</p>
                      <p className="text-xs text-ink-900/50">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <Container className="max-w-3xl">
          <RevealOnScroll>
            <div className="mb-12 flex flex-col items-center gap-3 text-center">
              <LotusOrnament className="h-4 w-24 text-gold-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-600">Questions</span>
              <h2 className="font-display text-4xl text-chocolate-950 sm:text-5xl">Frequently Asked</h2>
            </div>
          </RevealOnScroll>

          <div className="flex flex-col divide-y divide-beige-200 border-y border-beige-200">
            {FAQS.map((faq, index) => (
              <RevealOnScroll key={faq.question} delay={index * 0.06}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-chocolate-950 marker:content-none">
                    <span className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rotate-45 bg-gold-500" aria-hidden="true" />
                      {faq.question}
                    </span>
                    <Plus size={16} className="shrink-0 text-gold-600 transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 pl-6 text-sm leading-relaxed text-ink-900/70">{faq.answer}</p>
                </details>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>
    </div>
  )
}
