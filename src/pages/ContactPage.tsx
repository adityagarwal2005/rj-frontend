import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { LotusOrnament } from '@/components/ui/LotusOrnament'
import { PaisleyDivider } from '@/components/ui/PaisleyDivider'
import { RangoliCorner } from '@/components/ui/RangoliCorner'
import { HawaMahalSilhouette } from '@/components/ui/HawaMahalSilhouette'

const CONTACT_METHODS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 70142 53541',
    href: 'https://wa.me/917014253541',
    accent: 'text-peacock-600',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 70142 53541',
    href: 'tel:+917014253541',
    accent: 'text-gold-600',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'hello@rajwaditukda.com',
    href: 'mailto:hello@rajwaditukda.com',
    accent: 'text-henna-600',
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: 'Bani Park, Jaipur',
    href: 'https://www.google.com/maps/search/?api=1&query=Bani+Park%2C+Jaipur%2C+Rajasthan',
    accent: 'text-jaipur-600',
  },
  {
    icon: InstagramIcon,
    label: 'Instagram',
    value: '@rajwaditukda',
    href: 'https://www.instagram.com/rajwaditukda',
    accent: 'text-jaipur-500',
  },
]

export function ContactPage() {
  useDocumentTitle('Contact Us', {
    description: "Get in touch with RajwadiTukda — reach us via WhatsApp, phone, or email for orders and questions.",
    canonicalPath: '/contact',
  })

  return (
    <div>
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 py-20 text-center text-cream-50 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.06]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        <RangoliCorner className="pointer-events-none absolute left-0 top-0 h-24 w-24 text-gold-400/25" aria-hidden="true" />
        <RangoliCorner className="pointer-events-none absolute right-0 top-0 h-24 w-24 -scale-x-100 text-gold-400/25" aria-hidden="true" />
        <HawaMahalSilhouette
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-gold-300/25 [mask-image:linear-gradient(to_top,black_60%,transparent)]"
          aria-hidden="true"
        />
        <Container>
          <LotusOrnament className="mx-auto h-4 w-24 text-gold-400" />
          <span className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.4em] text-gold-400">
            Get in Touch
          </span>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-6xl">
            We&rsquo;d Love to <span className="italic text-gradient-gold">Hear From You</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-cream-50/70">
            Questions about an order, bulk gifting, or just want to say hello? Reach us directly through
            any of the channels below.
          </p>
          <PaisleyDivider className="mx-auto mt-6 h-3 w-56 text-gold-400/70" />
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {CONTACT_METHODS.map(({ icon: Icon, label, value, href, accent }, index) => {
            const isExternal = href.startsWith('http')
            return (
              <RevealOnScroll key={label} delay={index * 0.08}>
                <a
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="block"
                >
                  <Card className="flex flex-col items-center gap-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury-lg">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/40 bg-gradient-to-br from-cream-50 to-beige-200 shadow-[0_4px_12px_-4px_rgba(175,138,72,0.35)]">
                      <Icon size={22} className={accent} strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-900/50">{label}</p>
                    <p className="text-sm font-medium text-chocolate-950">{value}</p>
                  </Card>
                </a>
              </RevealOnScroll>
            )
          })}
        </div>

        <RevealOnScroll delay={0.2}>
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <PaisleyDivider className="mx-auto h-4 w-56 text-gold-500/70" />
            <p className="mt-6 font-script text-2xl leading-snug text-gold-600 sm:text-3xl">
              Padharo sa &mdash; we love company.
            </p>
            <p className="mt-3 text-sm text-ink-900/60">
              Our kitchen is in Bani Park, Jaipur. Say hi on WhatsApp before dropping by — we like to save a fresh batch for you.
            </p>
          </div>
        </RevealOnScroll>
      </Container>
    </div>
  )
}
