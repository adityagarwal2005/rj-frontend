export type NotificationType = 'order_update' | 'promotion' | 'system'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
}
