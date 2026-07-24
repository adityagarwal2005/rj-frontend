import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

interface LegalPageLayoutProps {
  title: string
  updatedOn: string
  children: ReactNode
}

export function LegalPageLayout({ title, updatedOn, children }: LegalPageLayoutProps) {
  return (
    <div>
      <section className="bg-grain relative overflow-hidden bg-chocolate-950 py-20 text-center text-cream-50 sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        <Container>
          <h1 className="font-serif text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cream-50/50">Last updated {updatedOn}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <RevealOnScroll>
            <div className="flex flex-col gap-6 text-sm leading-relaxed text-ink-900/80 [&_h2]:mt-4 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-chocolate-950 [&_a]:font-medium [&_a]:text-gold-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
              {children}
            </div>
          </RevealOnScroll>
        </Container>
      </section>
    </div>
  )
}
