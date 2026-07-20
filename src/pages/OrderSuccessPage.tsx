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
import { OrderDetailCard } from '@/components/orders/OrderDetailCard'

export function OrderSuccessPage() {
  useDocumentTitle('Order Placed')
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
      <div className="mb-8 text-center">
        <CheckCircle2 size={56} className="mx-auto text-emerald-600" strokeWidth={1.5} />
        <h1 className="mt-4 font-serif text-3xl text-chocolate-950">Order Placed!</h1>
        <p className="mt-2 text-sm text-ink-900/70">
          {order.status === 'awaiting_details'
            ? "Continue the conversation on WhatsApp to share your delivery address and complete payment."
            : "Please complete your payment below - we'll start preparing your chocolate as soon as it's confirmed."}
        </p>
      </div>

      <OrderDetailCard order={order} />

      <div className="mt-8 text-center">
        <Link to={ROUTES.products} className={buttonClasses('gold', 'md')}>
          Continue Shopping
        </Link>
      </div>
    </Container>
  )
}
