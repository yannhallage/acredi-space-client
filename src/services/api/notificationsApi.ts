import type { AppNotification } from '../../entities/notification/notification.types'
import { apiRequest } from './httpClient'

export const notificationsApi = {
  list: () => apiRequest<AppNotification[]>('/notifications'),
  markRead: (id: string) => apiRequest<AppNotification>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => apiRequest<void>('/notifications/read-all', { method: 'POST' }),
}
