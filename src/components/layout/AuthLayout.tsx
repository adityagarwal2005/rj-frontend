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
    <div className="bg-beige-100 py-20 sm:py-28">
      <Container className="max-w-md">
        <div className="rounded-[28px] border border-beige-200/80 bg-cream-50 p-8 shadow-luxury-lg sm:p-11">
          <div className="mb-9 flex flex-col items-center gap-4 text-center">
            <p className="flex items-center gap-2 font-serif text-2xl font-semibold text-chocolate-950">
              Rajwadi<span className="text-gold-500">Tukda</span>
              <TurbanIcon className="h-5 w-5 text-gold-500" aria-hidden="true" />
            </p>
            <span className="h-px w-10 bg-gold-400/60" />
            <div>
              <h1 className="font-serif text-3xl text-chocolate-950">{title}</h1>
              <p className="mt-2 text-sm text-ink-900/55">{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
      </Container>
    </div>
  )
}
