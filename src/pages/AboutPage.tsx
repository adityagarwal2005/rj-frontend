import { Link } from 'react-router-dom'
import { Crown, Flame, Gem, HandHeart, MapPin } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pageMeta } from '@/constants/pageMeta'
import { useBreadcrumbStructuredData } from '@/hooks/useBreadcrumbStructuredData'
import { ROUTES } from '@/constants/routes'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { HawaMahalSilhouette } from '@/components/ui/HawaMahalSilhouette'

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
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 text-cream-50">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.045]" aria-hidden="true" />
        <HawaMahalSilhouette
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-gold-300/[0.12] [mask-image:linear-gradient(to_top,black_40%,transparent)] sm:h-28"
          aria-hidden="true"
        />
        <Container className="py-20 sm:py-28 lg:py-32">
          <SectionHeading
            as="h1"
            tone="dark"
            spacing="none"
            eyebrow="Our Story"
            title={
              <>
                Rajasthani Roots, <span className="italic text-gradient-gold">Chocolate Craft</span>
              </>
            }
            description="A small Jaipur kitchen that’s trying to answer one question — what would a Rajasthani palace chocolatier make in 2026?"
          />
        </Container>
      </section>

      {/* PROSE */}
      <section className="bg-heritage-glow py-20 sm:py-28">
        <Container className="max-w-3xl">
          <RevealOnScroll>
            <blockquote className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-jaipur-600">Rajwadi Tukda</p>
              <p className="mt-4 font-display text-[30px] italic leading-[1.2] text-chocolate-950 sm:text-[40px]">
                &ldquo;A tukda — a piece — of Rajwadi grandeur, in every bite.&rdquo;
              </p>
              <div className="hairline-gold mx-auto mt-8 w-40" aria-hidden="true" />
            </blockquote>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="mt-12 flex flex-col gap-6 text-[16px] leading-[1.8] text-ink-900/75 sm:text-[17px]">
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
                and exactly as intended. We&rsquo;re just getting started — with our Kunafa and Biscoff
                chocolate bars leading the way — and more flavors are already in the workshop.
              </p>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      {/* VALUES */}
      <section className="border-y border-beige-200 bg-cream-100/50 py-20 sm:py-28">
        <Container>
          <RevealOnScroll>
            <SectionHeading
              eyebrow="What We Stand For"
              title={
                <>
                  Four things we <span className="italic text-gradient-royal">will not</span> compromise on
                </>
              }
            />
          </RevealOnScroll>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }, index) => (
              <RevealOnScroll key={title} delay={index * 0.06} className="h-full">
                <div className="flex h-full flex-col gap-4 rounded-[22px] border border-beige-200 bg-white p-7 shadow-soft">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/45 text-gold-600">
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <h3 className="font-display text-[26px] leading-tight text-chocolate-950">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink-900/60">{body}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* JAIPUR LOVE */}
      <section className="py-20 sm:py-28">
        <Container className="max-w-2xl text-center">
          <RevealOnScroll>
            <span className="inline-flex items-center gap-2 rounded-full border border-jaipur-500/30 bg-jaipur-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-jaipur-700">
              <MapPin size={12} /> Made in Bani Park, Jaipur
            </span>
            <h2 className="mt-6 font-display text-[40px] leading-[1.05] text-chocolate-950 sm:text-5xl">
              A love letter to the <span className="italic text-gradient-royal">Pink City</span>
            </h2>
            <p className="mt-5 text-[16px] leading-[1.8] text-ink-900/70">
              Jaipur taught us that grandeur is a habit — the way a shopkeeper wraps a mithai box, the
              way a haveli door is painted, the way a chai vendor pours from a height. We wanted a
              chocolate that carried that same care in every corner, from the label on the box to the
              last snap of the last square.
            </p>
            <p className="mt-6 font-script text-2xl text-gold-600">Padharo sa &mdash; welcome home</p>
          </RevealOnScroll>

          <div className="mt-10">
            <Link to={ROUTES.products} className={buttonClasses('gold', 'lg')}>
              Explore the Chocolates
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}
