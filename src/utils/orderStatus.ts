import type { BadgeTone } from '@/components/ui/Badge'
import type { OrderStatus } from '@/types/order'

const STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_details: 'Awaiting Details',
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  awaiting_details: 'neutral',
  pending: 'neutral',
  confirmed: 'gold',
  processing: 'gold',
  shipped: 'gold',
  delivered: 'success',
  cancelled: 'danger',
}

export function orderStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status]
}

export function orderStatusTone(status: OrderStatus): BadgeTone {
  return STATUS_TONES[status]
}

export function isCancellableStatus(status: OrderStatus): boolean {
  return status === 'awaiting_details' || status === 'pending' || status === 'confirmed'
}
