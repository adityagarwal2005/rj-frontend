import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type BadgeTone = 'gold' | 'chocolate' | 'success' | 'danger' | 'neutral'

const TONE_CLASSES: Record<BadgeTone, string> = {
  gold: 'border border-gold-400/60 bg-gold-400/10 text-gold-700',
  chocolate: 'bg-chocolate-950 text-cream-50',
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-red-100 text-red-800',
  neutral: 'bg-beige-200 text-chocolate-900',
}

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  )
}
