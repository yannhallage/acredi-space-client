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
    const response = await http.get<ApiResponse<MessageResponse[]>>(
      chatEndpoints.messages(channelId),
    );

    return unwrapApiResponse(response);
  },

  async send(request: SendMessageRequest) {
    const response = await http.post<ApiResponse<MessageResponse>>(
      chatEndpoints.send,
      request,
    );

    return unwrapApiResponse(response);
  },
};
