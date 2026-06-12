export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  timestamp?: string;
}

export interface ChannelResponse {
  id: string;
  name: string;
  teamId: string | null;
  privateChannel: boolean;
  createdAt: string;
}

export interface MessageResponse {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  channelId: string;
  content: string;
}
