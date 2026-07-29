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

export interface ChatAttachmentResponse {
  id: string;
  name: string;
  contentType?: string | null;
  sizeBytes: number;
  downloadUrl: string;
}

export type ChatMessageKind = "NORMAL" | "SHARED";

export interface ForwardedMessagePreview {
  id: string;
  senderName: string;
  content: string;
  deletedAt?: string | null;
}

export interface MessageResponse {
  id: string;
  channelId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  attachments?: ChatAttachmentResponse[];
  kind?: ChatMessageKind;
  forwardedFrom?: ForwardedMessagePreview | null;
}

export interface SendMessageRequest {
  channelId: string;
  content: string;
  files?: globalThis.File[];
}

export interface ShareMessageRequest {
  userId: string;
}

export interface UpdateMessageRequest {
  content: string;
}
