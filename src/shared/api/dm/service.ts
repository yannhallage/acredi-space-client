import { http } from "../http";
import { chatEndpoints } from "./endpoints";
import type {
  ChannelResponse,
  CreateChannelRequest,
  CreateDirectChannelRequest,
  MessageResponse,
  SendMessageRequest,
} from "./types";

function unwrapApiResponse<TData>(response: any): TData {
  return response?.data as TData;
}

export const chatService = {
  async findChannels(): Promise<ChannelResponse[]> {
    const response = await http.get(chatEndpoints.channels);
    return unwrapApiResponse<ChannelResponse[]>(response);
  },

  async createChannel(
    request: CreateChannelRequest
  ): Promise<ChannelResponse> {
    const response = await http.post(chatEndpoints.createChannel, request);
    return unwrapApiResponse<ChannelResponse>(response);
  },

  async createDirectChannel(
    request: CreateDirectChannelRequest
  ): Promise<ChannelResponse> {
    const response = await http.post(chatEndpoints.directChannel, request);
    return unwrapApiResponse<ChannelResponse>(response);
  },

  async findMessages(channelId: string): Promise<MessageResponse[]> {
    const response = await http.get(chatEndpoints.messages(channelId));
    return unwrapApiResponse<MessageResponse[]>(response);
  },

  async sendMessage(
    request: SendMessageRequest
  ): Promise<MessageResponse> {
    const response = await http.post(chatEndpoints.send, request);
    return unwrapApiResponse<MessageResponse>(response);
  },
};
