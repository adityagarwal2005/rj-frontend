import { apiClient } from './apiClient'
import type { ApiSuccess, Paginated } from '@/types/api'
import type { Notification } from '@/types/notification'

export const notificationService = {
  async list(page = 1): Promise<Paginated<Notification>> {
    const res = await apiClient.get<ApiSuccess<Paginated<Notification>>>('/notifications/', {
      params: { page },
    })
    return res.data.data
  },

  async markRead(id: number): Promise<Notification> {
    const res = await apiClient.patch<ApiSuccess<Notification>>(`/notifications/${id}/read/`)
    return res.data.data
  },
}
