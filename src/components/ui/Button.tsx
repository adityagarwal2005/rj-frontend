import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'gold' | 'outline' | 'outline-light' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-chocolate-950 text-cream-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-chocolate-900 hover:shadow-luxury',
  // A two-stop gold with a top highlight reads as metal; a flat fill read as mustard.
  gold:
    'bg-[linear-gradient(180deg,#cfae6c_0%,#af8a48_100%)] text-chocolate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_24px_-12px_rgba(143,111,57,0.7)] hover:brightness-[1.06] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_16px_30px_-12px_rgba(143,111,57,0.75)]',
  outline:
    'border border-chocolate-950/20 bg-transparent text-chocolate-950 hover:border-chocolate-950 hover:bg-chocolate-950 hover:text-cream-50',
  'outline-light': 'border border-cream-50/30 text-cream-50 hover:border-cream-50 hover:bg-cream-50 hover:text-chocolate-950',
  ghost: 'text-chocolate-950 hover:bg-beige-200/70',
  danger: 'bg-red-800 text-cream-50 hover:bg-red-900',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-10 px-5 text-[11px]',
  md: 'h-12 px-7 text-xs',
  lg: 'h-14 px-9 text-[13px]',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold uppercase tracking-[0.14em]',
    'transition-[background-color,border-color,color,box-shadow,filter,transform] duration-300 ease-[var(--ease-luxe)] active:scale-[0.98]',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
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
      aria-busy={isLoading || undefined}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {isLoading && <Spinner size={16} className="text-current" />}
      {children}
    </button>
  )
})
