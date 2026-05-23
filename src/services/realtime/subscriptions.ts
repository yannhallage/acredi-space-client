export const realtimeTopics = {
  channelMessages: (channelId: string) => `/topic/channels/${channelId}/messages`,
  channelTyping: (channelId: string) => `/topic/channels/${channelId}/typing`,
  meetingChat: (meetingId: string) => `/topic/meetings/${meetingId}/chat`,
  directMessages: '/user/queue/direct-messages',
  notifications: '/user/queue/notifications',
  presence: '/topic/presence',
}
