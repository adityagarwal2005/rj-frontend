import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import type { Notification } from '@/types/notification'
import type { Paginated } from '@/types/api'
import { formatDate } from '@/utils/formatDate'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/utils/cn'

type LoadState = 'loading' | 'success' | 'error'

export function NotificationsPage() {
  useDocumentTitle('Notifications')
  const [page, setPage] = useState<Paginated<Notification> | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isMounted = true
    setState('loading')
    notificationService
      .list(currentPage)
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

  async function handleOpen(notification: Notification) {
    if (notification.is_read || !page) return
    try {
      const updated = await notificationService.markRead(notification.id)
      setPage({
        ...page,
        results: page.results.map((item) => (item.id === updated.id ? updated : item)),
      })
    } catch {
      // Non-critical - the notification just stays marked unread.
    }
  }

  return (
    <Container className="max-w-2xl py-16 sm:py-20">
      <h1 className="mb-8 font-serif text-4xl text-chocolate-950">Notifications</h1>

      {state === 'loading' && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      )}

      {state === 'error' && <ErrorState title="Couldn't load notifications" onRetry={() => setCurrentPage((p) => p)} />}

      {state === 'success' && page && page.results.length === 0 && (
        <EmptyState icon={Bell} title="No notifications yet" description="Order updates will show up here." />
      )}

      {state === 'success' && page && page.results.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {page.results.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleOpen(notification)}
                className={cn(
                  'flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors',
                  notification.is_read
                    ? 'border-beige-200 bg-white/60'
                    : 'border-gold-400 bg-gold-400/10',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-chocolate-950">{notification.title}</span>
                  {!notification.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-gold-500" />}
                </div>
                <p className="text-sm text-ink-900/70">{notification.message}</p>
                <p className="text-xs text-ink-900/40">{formatDate(notification.created_at)}</p>
              </button>
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
