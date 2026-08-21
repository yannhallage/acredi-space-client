import { http } from "../http";
import { chatEndpoints } from "./endpoints";
import type {
  ApiResponse,
  ChannelResponse,
  MessageResponse,
  SendMessageRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const chatService = {
  async findChannels() {
    const response = await http.get<ApiResponse<ChannelResponse[]>>(
      chatEndpoints.channels,
    );

    return unwrapApiResponse(response);
  },

  async findMessages(channelId: string) {
    const response = await http.get<
      ApiResponse<{ messages?: MessageResponse[] } | MessageResponse[]>
    >(chatEndpoints.messages(channelId));

    const data = unwrapApiResponse(response);
    return Array.isArray(data) ? data : data.messages ?? [];
  },

  async send(request: SendMessageRequest) {
    const response = await http.post<ApiResponse<MessageResponse>>(
      chatEndpoints.send,
      request,
    );

    return unwrapApiResponse(response);
  },

  async deleteMessage(messageId: string) {
    const response = await http.delete<ApiResponse<MessageResponse>>(
      chatEndpoints.message(messageId),
    );

    return unwrapApiResponse(response);
  },

  async updateMessage(messageId: string, content: string) {
    const response = await http.patch<ApiResponse<MessageResponse>>(
      chatEndpoints.message(messageId),
      { content },
    );

    return unwrapApiResponse(response);
  },
};
