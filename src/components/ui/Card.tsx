import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-beige-200/80 bg-white p-7 shadow-luxury transition-shadow duration-300 sm:p-8',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
