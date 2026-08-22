import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { buttonClasses } from '@/components/ui/Button'
import { PaisleyDivider } from '@/components/ui/PaisleyDivider'
import { OrderDetailCard } from '@/components/orders/OrderDetailCard'

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
      <Container className="py-16">
        <ErrorState title="Couldn't find that order" />
      </Container>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <Container className="max-w-2xl py-16 sm:py-20">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400/50 bg-gradient-to-br from-cream-50 to-beige-200 text-emerald-600 shadow-luxury">
          <CheckCircle2 size={30} strokeWidth={1.5} />
        </span>
        <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-600">Dhanyavaad</span>
        <h1 className="mt-2 font-display text-4xl leading-tight text-chocolate-950 sm:text-5xl">
          Your Order is <span className="italic text-gradient-gold">Placed</span>
        </h1>
        <PaisleyDivider className="mt-4 h-3 w-56 text-gold-500/70" />
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-900/70">
          {order.status === 'awaiting_details'
            ? 'Continue the conversation on WhatsApp to share your delivery address and complete payment.'
            : "Please complete your payment below — we'll start preparing your chocolate the moment it's confirmed."}
        </p>
      </div>

      <OrderDetailCard order={order} />

      <div className="mt-10 text-center">
        <Link to={ROUTES.products} className={buttonClasses('gold', 'md')}>
          Continue Shopping
        </Link>
        <p className="mt-4 font-script text-lg text-gold-600">Padharo sa &mdash; from our kitchen to yours</p>
      </div>
    </Container>
  )
}
