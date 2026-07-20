import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Truck, Wand2 } from 'lucide-react'
import { productService } from '@/services/productService'
import type { ProductListItem } from '@/types/product'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
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

  return (
    <div>
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 text-cream-50">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        <Container className="flex flex-col items-center gap-7 py-28 text-center sm:py-40">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-400"
          >
            <span className="h-px w-8 bg-gold-400/60" />
            Premium Rajasthani Chocolate
            <span className="h-px w-8 bg-gold-400/60" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl font-serif text-5xl font-semibold leading-[1.05] sm:text-7xl"
          >
            Chocolate <span className="italic text-gradient-gold">Fit for Royalty</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="max-w-lg text-base text-cream-50/65 sm:text-lg"
          >
            Handcrafted chocolate infused with bold Rajasthani flavors and premium ingredients,
            delivered fresh to your doorstep.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-2 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link to={ROUTES.products} className={buttonClasses('gold', 'lg')}>
              Shop Our Collection
            </Link>
            <Link to={ROUTES.about} className={buttonClasses('outline-light', 'lg')}>
              Our Story
            </Link>
          </motion.div>
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
