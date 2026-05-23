export type NotificationType =
  | 'FILE_SHARED'
  | 'FILE_UPLOADED'
  | 'MEETING_INVITE'
  | 'MEETING_REMINDER'
  | 'MESSAGE_MENTION'
  | 'DIRECT_MESSAGE'
  | 'PERMISSION_CHANGED'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  readAt?: string
  createdAt: string
}
