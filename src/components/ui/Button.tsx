import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'gold' | 'outline' | 'outline-light' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-chocolate-950 text-cream-50 hover:bg-chocolate-900 hover:-translate-y-0.5 hover:shadow-luxury active:translate-y-0',
  gold: 'bg-gold-500 text-chocolate-950 shadow-[0_8px_24px_-8px_rgba(175,138,72,0.5)] hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-10px_rgba(175,138,72,0.6)] active:translate-y-0',
  outline: 'border border-chocolate-950/25 text-chocolate-950 hover:border-chocolate-950 hover:bg-chocolate-950 hover:text-cream-50',
  'outline-light': 'border border-cream-50/30 text-cream-50 hover:border-cream-50 hover:bg-cream-50 hover:text-chocolate-950',
  ghost: 'text-chocolate-950 hover:bg-beige-200',
  danger: 'bg-red-800 text-cream-50 hover:bg-red-900',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-10 px-5 text-[11px]',
  md: 'h-12 px-7 text-xs',
  lg: 'h-14 px-9 text-[13px]',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.14em]',
    'transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', isLoading = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {isLoading && <Spinner size={16} className="text-current" />}
      {children}
    </button>
  )
})
