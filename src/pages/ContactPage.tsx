import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

const CONTACT_METHODS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 70142 53541',
    href: 'https://wa.me/917014253541',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 70142 53541',
    href: 'tel:+917014253541',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'hello@rajwaditukda.com',
    href: 'mailto:hello@rajwaditukda.com',
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: 'Bani Park, Jaipur, Rajasthan',
    href: undefined,
  },
]

export function ContactPage() {
  useDocumentTitle('Contact Us')

  return (
    <Container className="py-20 sm:py-28">
      <div className="mb-16 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-600">Get in Touch</span>
        <h1 className="mt-4 font-serif text-4xl text-chocolate-950 sm:text-5xl">We'd Love to Hear From You</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-900/60">
          Questions about an order, bulk gifting, or just want to say hello? Reach us directly through
          any of the channels below.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CONTACT_METHODS.map(({ icon: Icon, label, value, href }, index) => (
          <RevealOnScroll key={label} delay={index * 0.1}>
            <Card className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/40 bg-gold-400/10">
                <Icon size={22} className="text-gold-600" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-900/45">{label}</p>
              {href ? (
                <a href={href} className="text-sm font-medium text-chocolate-950 hover:text-gold-600">
                  {value}
                </a>
              ) : (
                <p className="text-sm font-medium text-chocolate-950">{value}</p>
              )}
            </Card>
          </RevealOnScroll>
        ))}
      </div>
    </Container>
  )
}
