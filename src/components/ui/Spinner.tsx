import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 28, className }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-gold-500', className)}
      aria-label="Loading"
      role="status"
    />
  )
}
