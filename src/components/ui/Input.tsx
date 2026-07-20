import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
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
      <input
        id={inputId}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          'h-12 rounded-xl border border-beige-300 bg-cream-50 px-4 text-sm text-ink-900 transition-colors duration-200',
          'placeholder:text-ink-900/35 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/30',
          error && 'border-red-700 focus:border-red-700 focus:ring-red-400/40',
          className,
        )}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-800">
          {error}
        </p>
      )}
    </div>
  )
})
