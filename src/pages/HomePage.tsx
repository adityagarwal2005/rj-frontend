import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Banknote,
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

// How long each hero photo holds before crossfading to the next. It used to
// slide every 1.8s, which read as restless rather than luxurious.
const HERO_IMAGE_INTERVAL_MS = 4200

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
  // Read off the two fields this effect actually uses, so both can be real
  // dependencies. Depending on `heroProduct` itself would re-run on every
  // render (new object identity each time); depending on slug alone left
  // primary_image able to go stale.
  const heroSlug = heroProduct?.slug
  const heroPrimaryImage = heroProduct?.primary_image

  useEffect(() => {
    if (!heroSlug) return
    let isMounted = true
    productService
      .getBySlug(heroSlug)
      .then((detail) => {
        if (!isMounted) return
        const urls = [...detail.images].sort((a, b) => a.display_order - b.display_order).map((img) => img.image)
        setHeroImages(urls.length > 0 ? urls : heroPrimaryImage ? [heroPrimaryImage] : [])
      })
      .catch(() => {
        if (isMounted && heroPrimaryImage) setHeroImages([heroPrimaryImage])
      })
    return () => {
      isMounted = false
    }
  }, [heroSlug, heroPrimaryImage])

  useEffect(() => {
    if (heroImages.length < 2) return
    const id = setInterval(() => {
      setHeroImageIndex((i) => (i + 1) % heroImages.length)
    }, HERO_IMAGE_INTERVAL_MS)
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

  const heroSubtotal = heroProduct ? unitPriceForQuantity(heroProduct, quantity) * quantity : 0
  const heroNextTier = heroProduct ? nextReachableTier(heroSubtotal) : null

  return (
    <div>
      {/* HERO */}
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 text-cream-50">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.045]" aria-hidden="true" />
        <HawaMahalSilhouette
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-gold-300/[0.12] [mask-image:linear-gradient(to_top,black_40%,transparent)] sm:h-28 lg:h-36"
          aria-hidden="true"
        />

        <Container className="grid items-center gap-12 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
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
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease: EASE }}
              className="mt-6 font-display text-[46px] font-medium leading-[0.96] tracking-[-0.02em] sm:text-[64px] lg:text-[80px]"
            >
              Chocolate <span className="italic text-gradient-gold">Fit for Royalty</span>
              {/* Second line inside the h1: the brand line above is memorable
                  but says nothing about what's actually sold, which is a gap
                  for both a first-time visitor and for search. */}
              <span className="mt-5 block font-sans text-[11.5px] font-medium uppercase leading-relaxed tracking-[0.26em] text-cream-50/55 sm:text-[13px]">
                Handmade Chocolates in Jaipur
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.14 }}
              className="mt-6 max-w-md text-[15px] leading-relaxed text-cream-50/65 sm:text-base"
            >
              A small Jaipur kitchen making chocolate by hand, in small batches — kunafa, Biscoff,
              kesar and more — and delivered to your door the day it&rsquo;s made.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease: EASE }}
              className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            >
              <Link to={ROUTES.products} className={buttonClasses('gold', 'lg')}>
                Shop the Collection <ArrowRight size={16} />
              </Link>
              <Link to={ROUTES.about} className={buttonClasses('outline-light', 'lg')}>
                Our Story
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="mx-auto w-full max-w-[400px] sm:max-w-[440px]"
          >
            {/* Arch-shaped photo inside an offset gold hairline - the jharokha
                silhouette without drawing a separate ornament over it. */}
            <div className="relative rounded-b-[30px] rounded-t-[999px] border border-gold-400/30 p-2.5 sm:p-3">
              <span
                className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold-400"
                aria-hidden="true"
              />
              <Link
                to={heroProduct ? ROUTES.productDetail(heroProduct.slug) : ROUTES.products}
                aria-label={heroProduct?.name ?? 'Shop the collection'}
                className="relative block aspect-[4/5] overflow-hidden rounded-b-[22px] rounded-t-[999px] bg-chocolate-900 shadow-arch"
              >
                {heroImages.length > 0 ? (
                  heroImages.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={index === heroImageIndex ? (heroProduct?.name ?? '') : ''}
                      aria-hidden={index !== heroImageIndex}
                      fetchPriority={index === 0 ? 'high' : 'low'}
                      decoding="async"
                      // The incoming photo fades in on top while the outgoing one
                      // stays fully opaque underneath and only disappears once
                      // covered. Fading both at once let the dark background
                      // show through mid-transition, dimming the photo.
                      className={cn(
                        'absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out',
                        index === heroImageIndex
                          ? 'z-[1] opacity-100 duration-[1200ms]'
                          : 'z-0 opacity-0 delay-[1200ms] duration-0',
                      )}
                    />
                  ))
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <TurbanIcon className="h-16 w-16 text-gold-400/30" aria-hidden="true" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate-950/45 via-transparent to-transparent" />
                {heroImages.length > 1 && (
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                    {heroImages.map((src, index) => (
                      <span
                        key={src}
                        className={cn(
                          'h-1 rounded-full transition-all duration-500',
                          index === heroImageIndex ? 'w-5 bg-gold-300' : 'w-1.5 bg-cream-50/45',
                        )}
                      />
                    ))}
                  </div>
                )}
              </Link>
            </div>

            <div className="mt-6 rounded-[22px] border border-cream-50/10 bg-cream-50/[0.04] p-5">
              {heroProduct ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="eyebrow text-[10px] text-gold-400">Signature &middot; {heroProduct.weight_label}</p>
                      <Link
                        to={ROUTES.productDetail(heroProduct.slug)}
                        className="mt-1.5 block font-display text-[28px] leading-tight text-cream-50 transition-colors hover:text-gold-300"
                      >
                        {heroProduct.name}
                      </Link>
                      {heroProduct.bulk_price && heroProduct.bulk_min_quantity && (
                        <p className="mt-1 text-xs text-gold-300/80">
                          Buy {heroProduct.bulk_min_quantity}+ for {formatCurrency(heroProduct.bulk_price)} each
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xl font-semibold tabular-nums text-gold-300">
                        {formatCurrency(unitPriceForQuantity(heroProduct, quantity))}
                      </p>
                      {heroProduct.in_stock && isLowStock(heroProduct.stock_quantity) && (
                        <p className="mt-1 text-[11px] font-medium text-jaipur-300">Only {heroProduct.stock_quantity} left</p>
                      )}
                    </div>
                  </div>

                  {heroProduct.in_stock ? (
                    <>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="flex h-14 items-center rounded-full border border-cream-50/20">
                          <button
                            type="button"
                            onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}
                            aria-label="Decrease quantity"
                            className="flex h-full w-11 items-center justify-center text-cream-50/80 hover:text-gold-300"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium tabular-nums">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity((qty) => Math.min(heroProduct.stock_quantity, qty + 1))}
                            aria-label="Increase quantity"
                            className="flex h-full w-11 items-center justify-center text-cream-50/80 hover:text-gold-300"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                        <Button variant="gold" size="lg" className="flex-1 px-4" isLoading={isAdding} onClick={handleAddToCart}>
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
                </>
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
      </section>

      {/* TRUST STRIP */}
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

      {/* FEATURED */}
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

      {/* HERITAGE */}
      <section className="defer-paint bg-heritage-glow border-y border-beige-200 py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <SectionHeading
              eyebrow="A Rajwadi Heritage"
              title={
                <>
                  Where a <span className="italic text-gradient-royal">Palace Recipe</span> Meets a Cocoa Bean
                </>
              }
              description="Rajasthan’s royal thalis balanced richness with restraint — heavy in ghee and saffron, but never overpowering. We build our chocolates the same way."
            />
          </RevealOnScroll>

          <div className="grid divide-y divide-beige-200 overflow-hidden rounded-[26px] border border-beige-200 bg-white shadow-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {HERITAGE_PILLARS.map(({ icon: Icon, kicker, title, description }, index) => (
              <RevealOnScroll key={title} delay={index * 0.08} className="h-full">
                <div className="flex h-full flex-col gap-4 p-7 sm:p-9">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/45 text-gold-600">
                      <Icon size={20} strokeWidth={1.5} />
                    </span>
                    <span className="font-display text-4xl italic text-beige-300" aria-hidden="true">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="eyebrow mt-2 text-[10px] text-jaipur-600">{kicker}</p>
                  <h3 className="font-display text-[28px] leading-tight text-chocolate-950">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink-900/60">{description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* QUOTE */}
      <section className="defer-paint bg-grain relative overflow-hidden bg-chocolate-950 py-24 text-center text-cream-50 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.04]" aria-hidden="true" />
        <Container className="max-w-3xl">
          <RevealOnScroll>
            <Quote size={30} strokeWidth={1.3} className="mx-auto text-gold-500" aria-hidden="true" />
            <p className="mt-7 font-display text-[32px] italic leading-[1.2] sm:text-5xl sm:leading-[1.15]">
              Where Rajasthan&rsquo;s royal heritage meets the craft of fine chocolate.
            </p>
            <div className="hairline-gold mx-auto mt-9 w-40" aria-hidden="true" />
            <p className="eyebrow mt-6 text-gold-400">The RajwadiTukda Kitchen &middot; Bani Park</p>
          </RevealOnScroll>
        </Container>
      </section>

      {/* CRAFT */}
      <section className="defer-paint py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <SectionHeading eyebrow="Our Craft" title="From Kitchen to Your Door" />
          </RevealOnScroll>

          <div className="relative grid gap-12 sm:grid-cols-3 sm:gap-8">
            <div
              className="pointer-events-none absolute left-[17%] right-[17%] top-7 hidden h-px bg-gold-400/40 sm:block"
              aria-hidden="true"
            />
            {VALUE_PROPS.map(({ icon: Icon, title, description }, index) => (
              <RevealOnScroll key={title} delay={index * 0.1}>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/45 bg-cream-50 text-gold-600">
                    <Icon size={22} strokeWidth={1.5} />
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-chocolate-950 text-[11px] font-semibold text-gold-300">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-[26px] leading-tight text-chocolate-950">{title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-ink-900/60">{description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <section className="defer-paint border-y border-beige-200 bg-cream-100/60 py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <SectionHeading eyebrow="Loved in Jaipur" title="Voices from the Pink City" />
          </RevealOnScroll>

          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <RevealOnScroll key={testimonial.name} delay={index * 0.08} className="h-full">
                <figure className="flex h-full flex-col rounded-[22px] border border-beige-200 bg-white p-7 shadow-soft">
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

      {/* OFFERS */}
      <section className="defer-paint py-20 sm:py-24">
        <Container>
          <RevealOnScroll>
            <SectionHeading align="left" eyebrow="Sweet Deals" title="Save More, Automatically" />
          </RevealOnScroll>
          <PromoTiles />
        </Container>
      </section>

      {/* FAQ */}
      <section className="defer-paint border-t border-beige-200 py-20 sm:py-28">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Questions" title="Frequently Asked" />

          <div className="divide-y divide-beige-200 border-y border-beige-200">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-[21px] leading-snug text-chocolate-950 marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-beige-300 text-gold-600 transition-transform duration-300 group-open:rotate-45">
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
