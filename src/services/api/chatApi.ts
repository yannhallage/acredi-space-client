import type { Channel, DirectConversation, Message } from '../../entities/chat/chat.types'
import type { ApiCollection } from '../../shared/types/api'
import { apiRequest } from './httpClient'

export const chatApi = {
  channels: () => apiRequest<Channel[]>('/channels'),
  channelMessages: (channelId: string) => apiRequest<ApiCollection<Message>>(`/channels/${channelId}/messages`),
  sendChannelMessage: (channelId: string, body: string) =>
    apiRequest<Message>(`/channels/${channelId}/messages`, { method: 'POST', body: { body } }),
  directConversations: () => apiRequest<DirectConversation[]>('/direct-conversations'),
  sendDirectMessage: (conversationId: string, body: string) =>
    apiRequest<Message>(`/direct-conversations/${conversationId}/messages`, { method: 'POST', body: { body } }),
}
