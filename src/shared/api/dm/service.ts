import { http } from "../http";
import { chatEndpoints } from "./endpoints";
import type {
  ChannelResponse,
  CreateChannelRequest,
  CreateDirectChannelRequest,
  MessageResponse,
  SendMessageRequest,
  ShareMessageRequest,
} from "./types";

interface ApiResponse<TData> {
  data: TData;
}

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

function buildMessageFormData(request: SendMessageRequest) {
  const formData = new FormData();
  const content = request.content.trim();

  if (content) {
    formData.append("content", content);
  }

  request.files?.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}

export const chatService = {
  async findChannels(): Promise<ChannelResponse[]> {
    const response = await http.get<ApiResponse<ChannelResponse[]>>(
      chatEndpoints.channels
    );
    return unwrapApiResponse(response);
  },

  async createChannel(
    request: CreateChannelRequest
  ): Promise<ChannelResponse> {
    const response = await http.post<ApiResponse<ChannelResponse>>(
      chatEndpoints.createChannel,
      request
    );
    return unwrapApiResponse(response);
  },

  async createDirectChannel(
    request: CreateDirectChannelRequest
  ): Promise<ChannelResponse> {
    const response = await http.post<ApiResponse<ChannelResponse>>(
      chatEndpoints.directChannel,
      request
    );
    return unwrapApiResponse(response);
  },

  async findMessages(channelId: string): Promise<MessageResponse[]> {
    const response = await http.get<ApiResponse<MessageResponse[]>>(
      chatEndpoints.messages(channelId)
    );
    return unwrapApiResponse(response);
  },

  async sendMessage(
    request: SendMessageRequest
  ): Promise<MessageResponse> {
    if (request.files?.length) {
      const response = await http.post<ApiResponse<MessageResponse>>(
        chatEndpoints.messages(request.channelId),
        buildMessageFormData(request)
      );

      return unwrapApiResponse(response);
    }

    const response = await http.post<ApiResponse<MessageResponse>>(
      chatEndpoints.send,
      {
        channelId: request.channelId,
        content: request.content,
      }
    );

    return unwrapApiResponse(response);
  },

  async deleteMessage(messageId: string): Promise<MessageResponse> {
    const response = await http.delete<ApiResponse<MessageResponse>>(
      chatEndpoints.message(messageId)
    );
    return unwrapApiResponse(response);
  },

  async updateMessage(
    messageId: string,
    content: string
  ): Promise<MessageResponse> {
    const response = await http.patch<ApiResponse<MessageResponse>>(
      chatEndpoints.message(messageId),
      { content }
    );
    return unwrapApiResponse(response);
  },

  async shareMessage(
    messageId: string,
    request: ShareMessageRequest
  ): Promise<MessageResponse> {
    const response = await http.post<ApiResponse<MessageResponse>>(
      chatEndpoints.share(messageId),
      request
    );
    return unwrapApiResponse(response);
  },
};
