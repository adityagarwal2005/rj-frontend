import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { TurbanIcon } from '@/components/ui/TurbanIcon'

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="bg-heritage-glow relative overflow-hidden py-14 sm:py-24">
      {/* Subtle jaali watermark washes the auth surface so it doesn't
          feel like a bare form dropped on a flat background. */}
      <div className="pointer-events-none absolute inset-0 bg-jaali opacity-[0.035]" aria-hidden="true" />

      <Container className="relative max-w-[460px]">
        <div className="rounded-[26px] border border-beige-200 bg-white p-7 shadow-luxury-lg sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-5 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/50 bg-gradient-to-br from-cream-50 to-beige-200 text-gold-600">
              <TurbanIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-[34px] leading-tight text-chocolate-950 sm:text-4xl">{title}</h1>
              <p className="mt-2 text-sm text-ink-900/55">{subtitle}</p>
            </div>
            <div className="hairline-gold w-32" aria-hidden="true" />
          </div>
          {children}
        </div>
      </Container>
    </div>
  )
}
