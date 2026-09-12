import type { LucideIcon } from 'lucide-react'
import { PackageOpen } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = PackageOpen, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[26px] border border-beige-200 bg-white px-6 py-14 text-center shadow-soft sm:py-16">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400/40 bg-cream-50 text-gold-600">
        <Icon size={26} strokeWidth={1.4} />
      </span>
      <h3 className="mt-2 font-display text-3xl leading-tight text-chocolate-950">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-relaxed text-ink-900/60">{description}</p>}
      {action}
    </div>
  )
}
