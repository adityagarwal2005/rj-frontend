import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { OrderDetailCard } from '@/components/orders/OrderDetailCard'

export function OrderDetailPage() {
  useDocumentTitle('Order Details')
  const { orderId = '' } = useParams()

  const [order, setOrder] = useState<Order | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    orderService
      .getOrder(orderId)
      .then(setOrder)
      .catch(() => setHasError(true))
  }, [orderId])

  return (
    <Container className="max-w-2xl py-16 sm:py-20">
      <Link to={ROUTES.orders} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-chocolate-900 hover:text-gold-600">
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      {hasError && <ErrorState title="Couldn't find that order" />}

      {!hasError && !order && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      )}

      {order && <OrderDetailCard order={order} allowCancel onCancelled={setOrder} />}
    </Container>
  )
}
