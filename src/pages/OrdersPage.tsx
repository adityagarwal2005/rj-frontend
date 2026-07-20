import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageOpen } from 'lucide-react'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order'
import type { Paginated } from '@/types/api'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { orderStatusLabel, orderStatusTone } from '@/utils/orderStatus'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { buttonClasses } from '@/components/ui/Button'

type LoadState = 'loading' | 'success' | 'error'

export function OrdersPage() {
  useDocumentTitle('My Orders')
  const [page, setPage] = useState<Paginated<Order> | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isMounted = true
    setState('loading')
    orderService
      .listOrders(currentPage)
      .then((data) => {
        if (!isMounted) return
        setPage(data)
        setState('success')
      })
      .catch(() => {
        if (isMounted) setState('error')
      })
    return () => {
      isMounted = false
    }
  }, [currentPage])

  return (
    <Container className="py-16 sm:py-20">
      <h1 className="mb-8 font-serif text-4xl text-chocolate-950">My Orders</h1>

      {state === 'loading' && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      )}

      {state === 'error' && (
        <ErrorState title="Couldn't load your orders" onRetry={() => setCurrentPage((p) => p)} />
      )}

      {state === 'success' && page && page.results.length === 0 && (
        <EmptyState
          icon={PackageOpen}
          title="No orders yet"
          description="Once you place an order, you'll be able to track it here."
          action={
            <Link to={ROUTES.products} className={buttonClasses('gold', 'md')}>
              Browse Chocolates
            </Link>
          }
        />
      )}

      {state === 'success' && page && page.results.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {page.results.map((order) => (
              <Link
                key={order.id}
                to={ROUTES.orderDetail(order.id)}
                className="flex flex-col gap-3 rounded-2xl border border-beige-200 bg-white/60 p-5 transition-colors hover:border-gold-400 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-xs text-ink-900/50">{order.id}</p>
                  <p className="mt-1 text-sm text-ink-900/70">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                  <span className="font-medium text-chocolate-950">{formatCurrency(order.total_amount)}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Pagination currentPage={page.current_page} totalPages={page.total_pages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
    </Container>
  )
}
