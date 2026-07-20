import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ROUTES } from '@/constants/routes'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

export function AboutPage() {
  useDocumentTitle('About Us')

  return (
    <div>
      <section className="bg-grain relative overflow-hidden bg-chocolate-950 py-24 text-center text-cream-50 sm:py-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        <Container>
          <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-400">Our Story</span>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl">
            Rajasthani Roots, <span className="italic text-gradient-gold">Chocolate Craft</span>
          </h1>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="max-w-2xl">
          <RevealOnScroll>
            <div className="flex flex-col gap-7 text-[15px] leading-relaxed text-ink-900/75 sm:text-base">
              <p className="font-serif text-xl italic leading-relaxed text-chocolate-950 sm:text-2xl">
                RajwadiTukda began with a simple idea: take the bold, warm flavors of Rajasthan and fold
                them into premium, handcrafted chocolate.
              </p>
              <p>
                Not a traditional mithai box, and not a generic chocolate bar — something new, made with
                the same care as a royal recipe. We use only premium Belgian-style chocolate, hand-selected
                fillings, and no shortcuts.
              </p>
              <p>
                Each batch is made fresh, in small quantities, so what reaches you is rich, textured, and
                exactly as intended. We're just getting started, with our signature Kunafa Chocolate
                crafted to show what this fusion can be. More flavours inspired by Rajasthan's royal
                heritage are on their way.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <div className="mt-12 text-center">
              <Link to={ROUTES.products} className={buttonClasses('gold', 'lg')}>
                Explore Our Chocolates
              </Link>
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    </div>
  )
}
