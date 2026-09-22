import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageHeaderProps {
  eyebrow: string
  title: string
  /** Right-aligned content - an item count, or an action button. */
  meta?: ReactNode
  className?: string
}

/**
 * The header every account/utility page (Orders, Addresses, Wishlist,
 * Notifications, Profile, Cart, Checkout) opens with: a gold eyebrow, a
 * large display title, and a bottom rule. Cart and Checkout hand-rolled
 * this same markup independently before this existed - extracted so all
 * six pages stay pixel-identical instead of quietly drifting apart.
 */
export function PageHeader({ eyebrow, title, meta, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4 border-b border-beige-200 pb-6', className)}>
      <div>
        <p className="eyebrow text-gold-600">{eyebrow}</p>
        <h1 className="mt-2 font-display text-[42px] leading-none text-chocolate-950 sm:text-[56px]">{title}</h1>
      </div>
      {meta && <div className="pb-1">{meta}</div>}
    </div>
  )
}
