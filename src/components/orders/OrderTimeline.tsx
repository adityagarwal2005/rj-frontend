import { Check, X } from 'lucide-react'
import type { Order, OrderStatus, OrderStatusHistoryEntry } from '@/types/order'
import { orderStatusLabel } from '@/utils/orderStatus'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

const TRACKING_STEPS: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered']

interface OrderTimelineProps {
  order: Order
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  if (order.status === 'cancelled') {
    const cancelledAt = order.status_history.find((entry) => entry.status === 'cancelled')?.created_at
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-700 text-white">
          <X size={16} />
        </span>
        <span>
          Order cancelled{cancelledAt && <> on {formatDate(cancelledAt)}</>}.
        </span>
      </div>
    )
  }

  if (order.status === 'awaiting_details' || order.status === 'pending') {
    return null
  }

  const timestamps = new Map<OrderStatus, string>(
    order.status_history.map((entry: OrderStatusHistoryEntry) => [entry.status, entry.created_at]),
  )
  const currentIndex = TRACKING_STEPS.indexOf(order.status)

  return (
    <div className="flex flex-col gap-0">
      {TRACKING_STEPS.map((step, index) => {
        const isComplete = index <= currentIndex
        const timestamp = timestamps.get(step)
        const isLast = index === TRACKING_STEPS.length - 1
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-colors',
                  isComplete ? 'bg-emerald-600' : 'bg-beige-300',
                )}
              >
                {isComplete && <Check size={16} />}
              </span>
              {!isLast && <span className={cn('w-px flex-1', isComplete ? 'bg-emerald-600' : 'bg-beige-300')} />}
            </div>
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p className={cn('text-sm font-medium', isComplete ? 'text-chocolate-950' : 'text-ink-900/40')}>
                {orderStatusLabel(step)}
              </p>
              {timestamp && <p className="text-xs text-ink-900/50">{formatDate(timestamp)}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
