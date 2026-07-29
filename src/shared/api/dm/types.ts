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

// export interface MessageResponse {
//   id: string;
//   channelId: string;
//   senderId: string;
//   senderName?: string;
//   content: string;
//   createdAt: string;
//   attachments?: ChatAttachmentResponse[];
// }

export interface SendMessageRequest {
  channelId: string;
  content: string;
  files?: globalThis.File[];
}


export type ForwardMessageRequest = {
  sourceType: "CHAT" | "GROUP";
  sourceMessageIds: string[];
  targetUserIds?: string[];
  targetChannelIds?: string[];
  targetTeamIds?: string[];
};

export type ForwardMessageResponse = {
  forwardedCount: number;
  createdChatMessageIds: string[];
  createdGroupMessageIds: string[];
};

export type MessageResponse = {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string | null;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
  deleted?: boolean;
  attachments?: ChatAttachmentResponse[];
};

export type UpdateMessageRequest = {
  content: string;
};
