import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Clock, MessageCircle, X } from 'lucide-react'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { BrandLoader } from '@/components/ui/BrandLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { buttonClasses } from '@/components/ui/Button'
import { OrderDetailCard } from '@/components/orders/OrderDetailCard'

type Tone = 'success' | 'waiting' | 'cancelled'

/**
 * What the header says depends on where the order actually is. It used to
 * tell every customer to "complete your payment below" - including someone
 * who had just paid through Razorpay (whose order is already confirmed, with
 * nothing below to pay) and a Cash on Delivery customer, directly above a
 * notice saying no payment was needed.
 */
function headlineFor(order: Order): { tone: Tone; eyebrow: string; title: string; body: string } {
  if (order.status === 'cancelled') {
    return {
      tone: 'cancelled',
      eyebrow: 'Order cancelled',
      title: 'This order was cancelled',
      body: 'No payment is due for it. If that’s unexpected, message us on WhatsApp and we’ll sort it out.',
    }
  }
  if (order.status === 'awaiting_details') {
    return {
      tone: 'waiting',
      eyebrow: 'Dhanyavaad',
      title: 'Continue on WhatsApp',
      body: 'Your order is saved. Share your delivery address and complete payment in the WhatsApp chat.',
    }
  }
  if (order.status === 'pending' && order.payment_gateway === 'cod') {
    return {
      tone: 'success',
      eyebrow: 'Dhanyavaad',
      title: 'Your order is placed',
      body: `No payment needed now — keep ${formatCurrency(order.payment_amount_due ?? order.total_amount)} ready when it arrives. We’re preparing your chocolate.`,
    }
  }
  if (order.status === 'pending') {
    return {
      tone: 'waiting',
      eyebrow: 'Almost there',
      title: 'Your order is reserved',
      body: 'It isn’t paid for yet. Complete the payment below and we’ll start preparing it right away.',
    }
  }
  return {
    tone: 'success',
    eyebrow: 'Dhanyavaad',
    title: 'Your order is confirmed',
    body: 'Payment received — we’re preparing your chocolate now. A confirmation is on its way to your email.',
  }
}

const TONE_ICON = {
  success: { icon: Check, classes: 'bg-chocolate-950 text-gold-300' },
  waiting: { icon: Clock, classes: 'bg-cream-100 text-gold-700 border border-gold-400/50' },
  cancelled: { icon: X, classes: 'bg-red-50 text-red-700 border border-red-200' },
}

export function OrderSuccessPage() {
  useDocumentTitle('Order Placed', { noindex: true })
  const { orderId = '' } = useParams()
  const location = useLocation()
  const stateOrder = (location.state as { order?: Order } | null)?.order

  const [order, setOrder] = useState<Order | null>(stateOrder ?? null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (stateOrder) return
    orderService
      .getOrder(orderId)
      .then(setOrder)
      .catch(() => setHasError(true))
  }, [orderId, stateOrder])

  if (hasError) {
    return (
      <Container className="max-w-2xl py-16">
        <ErrorState title="Couldn't find that order" />
      </Container>
    )
  }

  if (!order) {
    return <BrandLoader label="Loading your order" />
  }

  const headline = headlineFor(order)
  const { icon: Icon, classes: iconClasses } = TONE_ICON[headline.tone]

  return (
    <div className="bg-heritage-glow">
      <Container className="max-w-2xl pb-20 pt-12 sm:pt-16">
        <div className="mb-10 flex flex-col items-center text-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className={`flex h-[72px] w-[72px] items-center justify-center rounded-full shadow-luxury ${iconClasses}`}
          >
            <Icon size={30} strokeWidth={1.8} />
          </motion.span>
          <p className="eyebrow mt-6 text-gold-600">{headline.eyebrow}</p>
          <h1 className="mt-2 font-display text-[42px] leading-[1.02] text-chocolate-950 sm:text-[56px]">{headline.title}</h1>
          <div className="hairline-gold mt-5 w-40" aria-hidden="true" />
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-900/65">{headline.body}</p>
        </div>

        <OrderDetailCard order={order} />

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to={ROUTES.products} className={buttonClasses('gold', 'md', 'w-full sm:w-auto')}>
            Continue Shopping
          </Link>
          <Link to={ROUTES.orders} className={buttonClasses('outline', 'md', 'w-full sm:w-auto')}>
            View My Orders
          </Link>
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-center font-script text-xl text-gold-600">
          <MessageCircle size={16} className="not-italic" /> Padharo sa &mdash; from our kitchen to yours
        </p>
      </Container>
    </div>
  )
}
