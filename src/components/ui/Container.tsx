import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Container({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mx-auto max-w-6xl px-4 sm:px-6 lg:px-8', className)} {...rest}>
      {children}
    </div>
  )
}
