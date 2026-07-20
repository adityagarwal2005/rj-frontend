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
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-beige-300 px-6 py-16 text-center">
      <Icon size={40} className="text-gold-500" strokeWidth={1.5} />
      <h3 className="font-serif text-xl text-chocolate-950">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-900/70">{description}</p>}
      {action}
    </div>
  )
}
