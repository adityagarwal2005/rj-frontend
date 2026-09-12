import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pageMeta } from '@/constants/pageMeta'
import { useBreadcrumbStructuredData } from '@/hooks/useBreadcrumbStructuredData'
import { Container } from '@/components/ui/Container'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { InstagramIcon } from '@/components/ui/InstagramIcon'

const CONTACT_METHODS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 70142 53541',
    note: 'Chat with us directly',
    href: 'https://wa.me/917014253541',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 70142 53541',
    note: '10am – 8pm, every day',
    href: 'tel:+917014253541',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'adityakp215@gmail.com',
    note: 'For gifting and bulk orders',
    href: 'mailto:adityakp215@gmail.com',
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: 'Bani Park, Jaipur',
    note: 'Message before dropping by',
    href: 'https://www.google.com/maps/search/?api=1&query=Bani+Park%2C+Jaipur%2C+Rajasthan',
  },
  {
    icon: InstagramIcon,
    label: 'Instagram',
    value: '@rajwaditukda',
    note: 'Fresh batches and behind the scenes',
    href: 'https://www.instagram.com/rajwaditukda',
  },
]

export function ContactPage() {
  useDocumentTitle(pageMeta('/contact').title, {
    description: pageMeta('/contact').description,
    canonicalPath: '/contact',
  })
  useBreadcrumbStructuredData([{ name: 'Home', path: '/' }, { name: 'Contact' }])

  return (
    <div>
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 text-cream-50">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.04]" aria-hidden="true" />
        <Container className="py-14 sm:py-20">
          <SectionHeading
            as="h1"
            tone="dark"
            spacing="none"
            eyebrow="Get in Touch"
            title={
              <>
                We&rsquo;d Love to <span className="italic text-gradient-gold">Hear From You</span>
              </>
            }
            description="Questions about an order, bulk gifting, or just want to say hello? Reach us directly through any of the channels below."
          />
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {CONTACT_METHODS.map(({ icon: Icon, label, value, note, href }, index) => {
            const isExternal = href.startsWith('http')
            return (
              <RevealOnScroll key={label} delay={index * 0.05} className={index === 0 ? 'sm:col-span-2' : undefined}>
                <a
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="group flex items-center gap-4 rounded-[22px] border border-beige-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/60 hover:shadow-luxury sm:p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-chocolate-950 text-gold-300">
                    <Icon size={20} strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="eyebrow block text-[10px] text-ink-900/45">{label}</span>
                    <span className="mt-1 block truncate font-display text-[22px] leading-tight text-chocolate-950">{value}</span>
                    <span className="mt-0.5 block text-xs text-ink-900/50">{note}</span>
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-gold-600 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </RevealOnScroll>
            )
          })}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="hairline-gold mx-auto w-40" aria-hidden="true" />
          <p className="mt-6 font-script text-[28px] leading-snug text-gold-600 sm:text-3xl">Padharo sa &mdash; we love company.</p>
          <p className="mt-3 text-sm text-ink-900/60">
            Our kitchen is in Bani Park, Jaipur. Say hi on WhatsApp before dropping by — we like to save a fresh batch for you.
          </p>
        </div>
      </Container>
    </div>
  )
}
