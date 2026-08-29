import { Link } from 'react-router-dom'
import { Crown, Flame, Gem, HandHeart, MapPin, Sparkles } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pageMeta } from '@/constants/pageMeta'
import { useBreadcrumbStructuredData } from '@/hooks/useBreadcrumbStructuredData'
import { ROUTES } from '@/constants/routes'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { HawaMahalSilhouette } from '@/components/ui/HawaMahalSilhouette'
import { JharokhaArch } from '@/components/ui/JharokhaArch'
import { PaisleyDivider } from '@/components/ui/PaisleyDivider'
import { PeacockFeather } from '@/components/ui/PeacockFeather'
import { LotusOrnament } from '@/components/ui/LotusOrnament'
import { RangoliCorner } from '@/components/ui/RangoliCorner'

const VALUES = [
  {
    icon: Crown,
    title: 'Royal Restraint',
    body: 'Rich, but never showy. The best palace recipes let one flavor lead — kesar, kunafa, gulab — and we do the same in every bar.',
  },
  {
    icon: Gem,
    title: 'Fine Materials',
    body: 'Belgian-style couverture, real saffron, cold-pressed ghee, hand-toasted kataifi. No compromises on what goes in.',
  },
  {
    icon: Flame,
    title: 'Small-Batch Craft',
    body: 'Every square is tempered and finished by hand. We would rather sell out than pull from a shelf.',
  },
  {
    icon: HandHeart,
    title: 'For Our City First',
    body: 'Made in Bani Park, delivered same-day across Jaipur. Our neighbours are our first tasters and our toughest critics.',
  },
]

export function AboutPage() {
  useDocumentTitle(pageMeta('/about').title, {
    description: pageMeta('/about').description,
    canonicalPath: '/about',
  })
  useBreadcrumbStructuredData([{ name: 'Home', path: '/' }, { name: 'Our Story' }])

  return (
    <div>
      {/* HERITAGE HERO */}
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 py-24 text-center text-cream-50 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.07]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        <HawaMahalSilhouette
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-gold-300/25 [mask-image:linear-gradient(to_top,black_55%,transparent)] sm:h-32"
          aria-hidden="true"
        />
        <RangoliCorner className="pointer-events-none absolute left-0 top-0 h-28 w-28 text-gold-400/25" aria-hidden="true" />
        <RangoliCorner className="pointer-events-none absolute right-0 top-0 h-28 w-28 -scale-x-100 text-gold-400/25" aria-hidden="true" />
        <PeacockFeather
          className="pointer-events-none absolute -left-4 top-16 hidden h-40 w-auto text-gold-400/25 md:block float-slow"
          aria-hidden="true"
        />
        <PeacockFeather
          className="pointer-events-none absolute -right-4 top-24 hidden h-40 w-auto -scale-x-100 text-jaipur-500/25 md:block drift-slow"
          aria-hidden="true"
        />

        <Container>
          <RevealOnScroll>
            <LotusOrnament className="mx-auto h-4 w-28 text-gold-400" />
            <span className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.4em] text-gold-400">
              Our Story
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
              Rajasthani Roots, <span className="italic text-gradient-gold">Chocolate Craft</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-cream-50/70 sm:text-base">
              A small Jaipur kitchen that&rsquo;s trying to answer one question — what would a Rajasthani
              palace chocolatier make in 2026?
            </p>
            <PaisleyDivider className="mx-auto mt-8 h-4 w-64 text-gold-400/70" />
          </RevealOnScroll>
        </Container>
      </section>

      {/* PROSE — a jharokha arch frames the opening line, kalam script sits
          as a marginal note above the paragraph. */}
      <section className="bg-heritage-glow relative overflow-hidden py-20 sm:py-28">
        <Container className="max-w-3xl">
          <RevealOnScroll>
            <div className="relative mx-auto mb-12 flex max-w-2xl justify-center">
              <JharokhaArch className="pointer-events-none absolute inset-x-4 -top-4 bottom-0 h-auto w-[calc(100%-2rem)] text-gold-400/40" aria-hidden="true" />
              <blockquote className="relative px-6 pt-10 text-center">
                <p className="font-script text-2xl leading-snug text-jaipur-600 sm:text-3xl">Rajwadi Tukda</p>
                <p className="mt-2 font-display text-2xl italic leading-tight text-chocolate-950 sm:text-3xl">
                  &ldquo;A tukda — a piece — of Rajwadi grandeur, in every bite.&rdquo;
                </p>
              </blockquote>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-ink-900/75 sm:text-base">
              <p>
                RajwadiTukda began with a simple idea: take the bold, warm flavors of Rajasthan and
                fold them into premium, handcrafted chocolate. Not a mithai box, not a generic chocolate
                bar — a third thing that treats both traditions with respect.
              </p>
              <p>
                We use Belgian-style couverture, hand-selected fillings and no shortcuts. Real saffron
                from Kashmir. Real kataifi, toasted the morning of. Ghee that&rsquo;s cold-pressed a
                few streets away. The kind of details a palace kitchen would obsess over.
              </p>
              <p>
                Every batch is made fresh, in small quantities, so what reaches you is rich, textured
                and exactly as intended. We&rsquo;re just getting started — with our signature Kunafa
                Chocolate leading the way — and more royal flavors are already in the workshop.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <PaisleyDivider className="mx-auto mt-12 h-4 w-64 text-gold-500/70" />
          </RevealOnScroll>
        </Container>
      </section>

      {/* VALUES — four pillars in arch cards, mirrors the home page
          heritage section but tighter, so about-page skimmers still get
          the same core message. */}
      <section className="border-y border-beige-200 bg-cream-50 py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <div className="mb-14 flex flex-col items-center gap-3 text-center">
              <LotusOrnament className="h-4 w-24 text-gold-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-600">
                What We Stand For
              </span>
              <h2 className="max-w-2xl font-display text-4xl leading-[1.05] text-chocolate-950 sm:text-5xl">
                Four things we <span className="italic text-gradient-royal">will not</span> compromise on
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }, index) => (
              <RevealOnScroll key={title} delay={index * 0.08}>
                <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-t-[80px] rounded-b-2xl border border-gold-400/25 bg-white p-6 pt-10 text-center shadow-luxury transition-all duration-500 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-luxury-lg">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-jaali opacity-[0.05]" />
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/50 bg-gradient-to-br from-cream-50 to-beige-200 text-gold-600 transition-transform duration-500 group-hover:rotate-[6deg]">
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <h3 className="font-display text-xl leading-tight text-chocolate-950">{title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-ink-900/65">{body}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* JAIPUR LOVE — a short note about where we're from, with a
          location pill and the peacock/paisley language reappearing to
          close the loop. */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <PeacockFeather
          className="pointer-events-none absolute -left-8 top-6 hidden h-52 w-auto text-gold-400/20 md:block float-slow"
          aria-hidden="true"
        />
        <PeacockFeather
          className="pointer-events-none absolute -right-8 bottom-6 hidden h-52 w-auto -scale-x-100 text-jaipur-500/15 md:block drift-slow"
          aria-hidden="true"
        />
        <Container className="max-w-2xl text-center">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 rounded-full border border-jaipur-500/30 bg-jaipur-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-jaipur-700">
              <MapPin size={12} /> Made in Bani Park, Jaipur
            </span>
            <h2 className="mt-6 font-display text-4xl leading-[1.05] text-chocolate-950 sm:text-5xl">
              A love letter to the <span className="italic text-gradient-royal">Pink City</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-900/70 sm:text-base">
              Jaipur taught us that grandeur is a habit — the way a shopkeeper wraps a mithai box, the
              way a haveli door is painted, the way a chai vendor pours from a height. We wanted a
              chocolate that carried that same care in every corner, from the label on the box to the
              last snap of the last square.
            </p>
            <p className="mt-6 flex items-center justify-center gap-1.5 font-script text-2xl text-gold-600">
              <Sparkles size={16} /> Padharo sa &mdash; welcome home
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <div className="mt-12">
              <Link to={ROUTES.products} className={buttonClasses('gold', 'lg')}>
                Explore the Chocolates
              </Link>
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    </div>
  )
}
