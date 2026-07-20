import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, id, className, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[11px] font-semibold uppercase tracking-[0.1em] text-chocolate-900/80">
        {label}
      </label>
      <textarea
        id={inputId}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(
          'min-h-24 rounded-xl border border-beige-300 bg-cream-50 px-4 py-3 text-sm text-ink-900 transition-colors duration-200',
          'placeholder:text-ink-900/35 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/30',
          error && 'border-red-700 focus:border-red-700 focus:ring-red-400/40',
          className,
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-800">{error}</p>}
    </div>
  )
})
