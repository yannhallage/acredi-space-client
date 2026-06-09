export interface ChannelResponse {
  id: string;
  name: string;
  privateChannel: boolean;
  teamId?: string | null;
  createdById?: string;
  createdAt?: string;
  displayName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface CreateChannelRequest {
  name: string;
  privateChannel: boolean;
  teamId?: string | null;
}

export interface CreateDirectChannelRequest {
  userId: string;
}

export interface MessageResponse {
  id: string;
  channelId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  channelId: string;
  content: string;
}
