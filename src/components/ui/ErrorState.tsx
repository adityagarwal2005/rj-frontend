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
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-red-200 px-6 py-16 text-center">
      <AlertTriangle size={40} className="text-red-700" strokeWidth={1.5} />
      <h3 className="font-serif text-xl text-chocolate-950">{title}</h3>
      <p className="max-w-sm text-sm text-ink-900/70">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
