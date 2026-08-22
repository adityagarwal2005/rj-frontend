import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { TurbanIcon } from '@/components/ui/TurbanIcon'
import { PaisleyDivider } from '@/components/ui/PaisleyDivider'
import { RangoliCorner } from '@/components/ui/RangoliCorner'

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
    <div className="relative overflow-hidden bg-cream-50 py-20 sm:py-28">
      {/* Subtle jaali watermark washes the auth surface so it doesn't
          feel like a bare form dropped on a flat background. */}
      <div className="pointer-events-none absolute inset-0 bg-jaali opacity-[0.04]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

      <Container className="relative max-w-md">
        <div className="relative overflow-hidden rounded-[28px] border border-beige-200/80 bg-white/95 p-8 shadow-luxury-lg sm:p-11">
          <RangoliCorner className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 text-gold-400/25" aria-hidden="true" />
          <RangoliCorner className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 -scale-x-100 text-gold-400/25" aria-hidden="true" />

          <div className="relative mb-9 flex flex-col items-center gap-4 text-center">
            <p className="flex items-center gap-2 font-serif text-2xl font-semibold text-chocolate-950">
              Rajwadi<span className="text-gold-500">Tukda</span>
              <TurbanIcon className="h-5 w-5 text-gold-500" aria-hidden="true" />
            </p>
            <PaisleyDivider className="h-3 w-32 text-gold-500/70" />
            <div>
              <h1 className="font-display text-3xl text-chocolate-950 sm:text-4xl">{title}</h1>
              <p className="mt-2 text-sm text-ink-900/55">{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
      </Container>
    </div>
  )
}
