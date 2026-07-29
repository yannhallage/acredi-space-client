// export const chatEndpoints = {
//   channels: "/chat/channels",
//   messages: (channelId: string) => `/chat/channels/${channelId}/messages`,
//   send: "/chat/messages",
// } as const;

export const chatEndpoints = {
  channels: "/channels",
  createChannel: "/channels",
  directChannel: "/channels/direct",

  messages: (channelId: string) => `/chat/channels/${channelId}/messages`,
  send: "/chat/messages",
  message: (messageId: string) => `/chat/messages/${messageId}`,
} as const;