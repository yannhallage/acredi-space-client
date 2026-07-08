import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { chatService } from "./service";
import type {
  ChannelResponse,
  CreateChannelRequest,
  CreateDirectChannelRequest,
  ForwardMessageRequest,
  ForwardMessageResponse,
  MessageResponse,
   UpdateMessageRequest,
  SendMessageRequest,
} from "./types";

export const chatKeys = {
  all: ["chat"] as const,

  channels: () => [...chatKeys.all, "channels"] as const,

  messages: (channelId: string) =>
    [...chatKeys.all, "messages", channelId] as const,
};

export function useChannelsQuery(enabled = true) {
  return useQuery<ChannelResponse[]>({
    queryKey: chatKeys.channels(),
    queryFn: () => chatService.findChannels(),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useMessagesQuery(channelId?: string) {
  return useQuery<MessageResponse[]>({
    queryKey: chatKeys.messages(channelId ?? ""),
    queryFn: () => chatService.findMessages(channelId!),
    enabled: Boolean(channelId),
    staleTime: 1000 * 10,
  });
}

export function useMessagesQueries(channelIds: string[]) {
  return useQueries({
    queries: channelIds.map((channelId) => ({
      queryKey: chatKeys.messages(channelId),
      queryFn: () => chatService.findMessages(channelId),
      enabled: Boolean(channelId),
      staleTime: 1000 * 10,
    })),
  });
}

export function useCreateChannelMutation() {
  const queryClient = useQueryClient();

  return useMutation<ChannelResponse, Error, CreateChannelRequest>({
    mutationFn: (request) => chatService.createChannel(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.channels(),
      });
    },
  });
}

export function useCreateDirectChannelMutation() {
  const queryClient = useQueryClient();

  return useMutation<ChannelResponse, Error, CreateDirectChannelRequest>({
    mutationFn: (request) => chatService.createDirectChannel(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.channels(),
      });
    },
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, Error, SendMessageRequest>({
    mutationFn: (request) => chatService.sendMessage(request),
    onSuccess: (message) => {
      queryClient.setQueryData<MessageResponse[]>(
        chatKeys.messages(message.channelId),
        (oldMessages = []) => {
          const alreadyExists = oldMessages.some(
            (item) => item.id === message.id
          );

          if (alreadyExists) {
            return oldMessages;
          }

          return [...oldMessages, message];
        }
      );

      queryClient.invalidateQueries({
        queryKey: chatKeys.channels(),
      });
    },
  });
}

export function useForwardMessagesMutation() {
  const queryClient = useQueryClient();

  return useMutation<ForwardMessageResponse, Error, ForwardMessageRequest>({
    mutationFn: (request) => chatService.forwardMessages(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.all,
      });
    },
  });
}


export function useUpdateMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    MessageResponse,
    Error,
    { messageId: string; content: string }
  >({
    mutationFn: ({ messageId, content }) =>
      chatService.updateMessage(messageId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.all,
      });
    },
  });
}

export function useDeleteMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, Error, { messageId: string }>({
    mutationFn: ({ messageId }) => chatService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.all,
      });
    },
  });
}