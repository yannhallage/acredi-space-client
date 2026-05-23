import type { Message } from '../../entities/chat/chat.types'
import type { FileItem } from '../../entities/file/file.types'
import type { AppNotification } from '../../entities/notification/notification.types'
import type { PresenceStatus } from '../../entities/user/user.types'

export type RealtimeEvent =
  | { type: 'message.created'; payload: Message }
  | { type: 'file.created'; payload: FileItem }
  | { type: 'notification.created'; payload: AppNotification }
  | { type: 'presence.updated'; payload: { userId: string; presence: PresenceStatus } }
