import { useState } from 'react'
import { Gift, Star } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { ApiError } from '@/services/apiError'
import type { Order, OrderItem } from '@/types/order'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { isCancellableStatus, orderStatusLabel, orderStatusTone } from '@/utils/orderStatus'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ReviewForm } from '@/components/product/ReviewForm'
import { useToast } from '@/context/ToastContext'
import { PriceBreakdown } from './PriceBreakdown'
import { PaymentInstructions } from './PaymentInstructions'
import { WhatsAppContinueNotice } from './WhatsAppContinueNotice'
import { OrderTimeline } from './OrderTimeline'

interface OrderDetailCardProps {
  order: Order
  onCancelled?: (order: Order) => void
  allowCancel?: boolean
}

export function OrderDetailCard({ order, onCancelled, allowCancel = false }: OrderDetailCardProps) {
  const { showToast } = useToast()
  const [isCancelling, setIsCancelling] = useState(false)
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null)
  const [reviewedProductIds, setReviewedProductIds] = useState(order.reviewed_product_ids)

  async function handleCancel() {
    setIsCancelling(true)
    try {
      const updated = await orderService.cancelOrder(order.id)
      showToast('Order cancelled successfully.', 'success')
      onCancelled?.(updated)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Could not cancel order.', 'error')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 border-b border-beige-200 pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-900/50">Order ID</p>
          <p className="font-mono text-sm text-chocolate-950">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-ink-900/50">Placed on</p>
          <p className="text-sm text-chocolate-950">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
        {allowCancel && isCancellableStatus(order.status) && (
          <Button variant="ghost" size="sm" isLoading={isCancelling} onClick={handleCancel}>
            Cancel Order
          </Button>
        )}
      </div>

      <div className="py-4">
        <OrderTimeline order={order} />
      </div>

      {order.is_gift && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-gold-400/10 p-4 text-sm text-chocolate-950">
          <Gift size={18} className="mt-0.5 shrink-0 text-gold-600" />
          <div>
            <p className="font-medium">This is a gift order</p>
            {order.gift_message && <p className="mt-1 text-ink-900/70">"{order.gift_message}"</p>}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 py-4">
        {order.items.map((item) => {
          const canReview =
            order.status === 'delivered' &&
            item.product !== null &&
            item.product_slug &&
            !reviewedProductIds.includes(item.product)
          return (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm text-ink-900/80">
              <span>
                {item.product_name} &times; {item.quantity}
              </span>
              <div className="flex items-center gap-3">
                <span>{formatCurrency(item.subtotal)}</span>
                {canReview && (
                  <button
                    type="button"
                    onClick={() => setReviewingItem(item)}
                    className="flex items-center gap-1 text-xs font-medium text-gold-600 hover:underline"
                  >
                    <Star size={12} /> Rate
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={reviewingItem !== null}
        onClose={() => setReviewingItem(null)}
        title={`Rate ${reviewingItem?.product_name ?? ''}`}
      >
        {reviewingItem?.product_slug && (
          <ReviewForm
            productSlug={reviewingItem.product_slug}
            orderId={order.id}
            onSubmitted={() => {
              setReviewedProductIds((current) => [...current, reviewingItem.product as number])
              setReviewingItem(null)
            }}
          />
        )}
      </Modal>

      <div className="border-t border-beige-200 pt-4">
        <PriceBreakdown
          subtotalAmount={order.subtotal_amount}
          discountPercentage={order.discount_percentage}
          discountAmount={order.discount_amount}
          referralDiscountAmount={order.referral_discount_amount}
          totalAmount={order.total_amount}
        />
      </div>

      <div className="mt-4 rounded-2xl bg-beige-100 p-4 text-sm text-ink-900/70">
        <p className="font-medium text-chocolate-950">Delivering to</p>
        {order.address ? (
          <>
            <p>{order.address.full_name} &middot; {order.address.phone}</p>
            <p>
              {order.address.line1}
              {order.address.line2 && `, ${order.address.line2}`}, {order.address.city},{' '}
              {order.address.state} {order.address.postal_code}
            </p>
          </>
        ) : (
          <p>We'll confirm this with you on WhatsApp.</p>
        )}
      </div>

      {order.notes && <p className="mt-3 text-sm text-ink-900/70">Note: {order.notes}</p>}

      {order.status === 'pending' ? (
        <div className="mt-4">
          <PaymentInstructions amount={order.total_amount} orderId={order.id} />
        </div>
      ) : order.status === 'awaiting_details' ? (
        <div className="mt-4">
          <WhatsAppContinueNotice order={order} />
        </div>
      ) : (
        <p className="mt-4 text-xs text-ink-900/50">Payment: Prepaid via UPI</p>
      )}
    </Card>
  )
}
