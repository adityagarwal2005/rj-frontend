import { useEffect, useState } from 'react'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/context/AuthContext'

/**
 * Approximates the unread count from the most recent page of notifications
 * (the backend has no dedicated unread-count endpoint). Good enough for a
 * navbar badge - exact counts beyond the first page aren't worth a new
 * backend endpoint yet.
 */
export function useUnreadNotifications() {
  const { isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }
    notificationService
      .list(1)
      .then((data) => setUnreadCount(data.results.filter((n) => !n.is_read).length))
      .catch(() => setUnreadCount(0))
  }, [isAuthenticated])

  return unreadCount
}
