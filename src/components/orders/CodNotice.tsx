import { Banknote, CheckCircle2 } from 'lucide-react'
import type { Order } from '@/types/order'
import { formatCurrency } from '@/utils/formatCurrency'

interface CodNoticeProps {
  order: Order
}

/**
 * Shown instead of PaymentInstructions when the customer chose Cash on
 * Delivery - there's nothing to pay online, so no UPI QR/UTR box. The
 * payable amount (order total + COD fee) comes straight from
 * order.payment_amount_due rather than being recomputed here.
 */
export function CodNotice({ order }: CodNoticeProps) {
  return (
    <div className="rounded-2xl bg-gold-400/10 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-chocolate-950">
        <Banknote size={18} className="shrink-0 text-gold-600" /> Cash on Delivery
      </p>
      <p className="mt-2 text-xs text-ink-900/60">
        No payment needed now - just keep{' '}
        <span className="font-semibold text-chocolate-950">
          {formatCurrency(order.payment_amount_due ?? order.total_amount)}
        </span>{' '}
        in cash ready when your order arrives.
      </p>
      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 size={14} /> We're preparing your order.
      </p>
    </div>
  )
}
