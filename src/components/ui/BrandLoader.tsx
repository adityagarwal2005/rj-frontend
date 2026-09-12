import { cn } from '@/utils/cn'
import { TurbanIcon } from './TurbanIcon'

interface BrandLoaderProps {
  label?: string
  className?: string
  /** Fill most of the viewport - for a whole page that is still loading. */
  fullHeight?: boolean
}

/**
 * The page-level loading state: the safa mark inside a slowly turning gold
 * ring. Replaces a bare spinner wherever an entire page is waiting, so a
 * slow connection still looks like the brand rather than a stalled app.
 * Matches the splash in index.html, which shows before any JS has loaded.
 */
export function BrandLoader({ label = 'Loading', className, fullHeight = true }: BrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-4', fullHeight && 'min-h-[60vh]', className)}
    >
      <span className="relative flex h-16 w-16 items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full animate-spin [animation-duration:1.4s]"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="30" stroke="var(--color-beige-300)" strokeWidth="1.5" />
          <path d="M32 2a30 30 0 0 1 30 30" stroke="var(--color-gold-500)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <TurbanIcon className="h-7 w-7 text-gold-600" aria-hidden="true" />
      </span>
      <span className="eyebrow text-ink-900/45">{label}</span>
    </div>
  )
}
