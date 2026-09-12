import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[26px] border border-beige-200 bg-white px-6 py-14 text-center shadow-soft sm:py-16">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700">
        <AlertTriangle size={24} strokeWidth={1.5} />
      </span>
      <h3 className="mt-2 font-display text-3xl leading-tight text-chocolate-950">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-ink-900/60">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
