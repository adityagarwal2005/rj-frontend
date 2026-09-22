import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { BrandLoader } from '@/components/ui/BrandLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { OrderDetailCard } from '@/components/orders/OrderDetailCard'

export function OrderDetailPage() {
  useDocumentTitle('Order Details', { noindex: true })
  const { orderId = '' } = useParams()

  const [order, setOrder] = useState<Order | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isCurrent = true
    setOrder(null)
    setHasError(false)
    orderService
      .getOrder(orderId)
      .then((data) => {
        if (isCurrent) setOrder(data)
      })
      .catch(() => {
        if (isCurrent) setHasError(true)
      })
    return () => {
      isCurrent = false
    }
  }, [orderId])

  return (
    <Container className="max-w-2xl py-16 sm:py-20">
      <Link
        to={ROUTES.orders}
        className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-chocolate-900/70 transition-colors hover:text-chocolate-950"
      >
        <ArrowLeft size={14} /> Back to My Orders
      </Link>

      {hasError && <ErrorState title="Couldn't find that order" />}

      {!hasError && !order && <BrandLoader label="Loading your order" className="min-h-[40vh]" fullHeight={false} />}

      {order && <OrderDetailCard order={order} allowCancel onCancelled={setOrder} />}
    </Container>
  )
}
