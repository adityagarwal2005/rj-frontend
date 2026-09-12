import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'center' | 'left'
  tone?: 'light' | 'dark'
  /** Rendered opposite the heading on wide screens (left-aligned only), e.g. a "View all" link. */
  action?: ReactNode
  as?: 'h1' | 'h2'
  /** 'none' drops the bottom margin, for a heading that is the only thing in its block. */
  spacing?: 'default' | 'none'
  className?: string
}

/**
 * One heading treatment for every section on the site: a tracked gold
 * eyebrow, a Cormorant title and an optional supporting line. Sections
 * used to each hand-roll this with a different ornament on top (lotus,
 * paisley, rangoli), which is a lot of the visual noise the redesign removes.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
  action,
  as: Tag = 'h2',
  spacing = 'default',
  className,
}: SectionHeadingProps) {
  const hasSpacing = spacing === 'default'
  const isCenter = align === 'center'
  const isDark = tone === 'dark'

  const text = (
    <div className={cn('flex flex-col gap-3', isCenter ? 'items-center text-center' : 'items-start text-left')}>
      {eyebrow && (
        <span className={cn('eyebrow flex items-center gap-3', isDark ? 'text-gold-400' : 'text-gold-600')}>
          <span className={cn('h-px w-6', isDark ? 'bg-gold-400/60' : 'bg-gold-500/60')} aria-hidden="true" />
          {eyebrow}
          {isCenter && <span className={cn('h-px w-6', isDark ? 'bg-gold-400/60' : 'bg-gold-500/60')} aria-hidden="true" />}
        </span>
      )}
      <Tag
        className={cn(
          'max-w-2xl font-display text-[34px] leading-[1.05] sm:text-5xl',
          isDark ? 'text-cream-50' : 'text-chocolate-950',
        )}
      >
        {title}
      </Tag>
      {description && (
        <p className={cn('max-w-xl text-[15px] leading-relaxed', isDark ? 'text-cream-50/65' : 'text-ink-900/60')}>
          {description}
        </p>
      )}
    </div>
  )

  if (!action || isCenter) {
    return <div className={cn(hasSpacing && 'mb-10 sm:mb-14', className)}>{text}</div>
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        hasSpacing && 'mb-10 sm:mb-12',
        className,
      )}
    >
      {text}
      <div className="shrink-0">{action}</div>
    </div>
  )
}
