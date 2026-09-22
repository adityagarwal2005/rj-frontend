import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'

interface LegalPageLayoutProps {
  title: string
  updatedOn: string
  children: ReactNode
}

export function LegalPageLayout({ title, updatedOn, children }: LegalPageLayoutProps) {
  return (
    <div>
      <section className="bg-grain bg-hero-glow relative overflow-hidden bg-chocolate-950 text-cream-50">
        <div className="pointer-events-none absolute inset-0 bg-buta opacity-[0.04]" aria-hidden="true" />
        <Container className="py-14 sm:py-20">
          <SectionHeading as="h1" tone="dark" spacing="none" eyebrow={`Last updated ${updatedOn}`} title={title} />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <RevealOnScroll>
            <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-ink-900/75 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-chocolate-950 [&_a]:font-medium [&_a]:text-gold-600 [&_a]:underline [&_a]:decoration-gold-400/50 [&_a]:underline-offset-2 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5">
              {children}
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    </div>
  )
}
