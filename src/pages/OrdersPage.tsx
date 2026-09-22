import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, PackageOpen } from 'lucide-react'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order'
import type { Paginated } from '@/types/api'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { orderStatusLabel, orderStatusTone } from '@/utils/orderStatus'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { BrandLoader } from '@/components/ui/BrandLoader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { buttonClasses } from '@/components/ui/Button'

type LoadState = 'loading' | 'success' | 'error'

export function OrdersPage() {
  useDocumentTitle('My Orders', { noindex: true })
  const [page, setPage] = useState<Paginated<Order> | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [currentPage, setCurrentPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0)

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
  }, [currentPage, retryCount])

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Your History"
        title="My Orders"
        meta={
          page && page.count > 0 ? (
            <span className="text-sm text-ink-900/55">
              {page.count} order{page.count === 1 ? '' : 's'}
            </span>
          ) : undefined
        }
      />

      <div className="mt-8">
        {state === 'loading' && <BrandLoader label="Loading your orders" className="min-h-[40vh]" fullHeight={false} />}

        {state === 'error' && (
          <ErrorState title="Couldn't load your orders" onRetry={() => setRetryCount((count) => count + 1)} />
        )}

        {state === 'success' && page && page.results.length === 0 && (
          <EmptyState
            icon={PackageOpen}
            title="No orders yet"
            description="Once you place an order, you'll be able to track it here."
            action={
              <Link to={ROUTES.products} className={`${buttonClasses('gold', 'md')} mt-3`}>
                Browse Chocolates
              </Link>
            }
          />
        )}

        {state === 'success' && page && page.results.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              {page.results.map((order) => (
                <Link
                  key={order.id}
                  to={ROUTES.orderDetail(order.id)}
                  className="group flex items-center justify-between gap-4 rounded-[18px] border border-beige-200 bg-white p-5 shadow-soft transition-colors duration-300 hover:border-gold-400/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-ink-900/45">{order.id}</p>
                    <p className="mt-1 text-sm text-ink-900/65">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                    <span className="w-20 text-right font-medium tabular-nums text-chocolate-950">
                      {formatCurrency(order.total_amount)}
                    </span>
                    <ChevronRight
                      size={16}
                      className="hidden shrink-0 text-ink-900/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-gold-600 sm:block"
                    />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10">
              <Pagination currentPage={page.current_page} totalPages={page.total_pages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>
    </Container>
  )
}
