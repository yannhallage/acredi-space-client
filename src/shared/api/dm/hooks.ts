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
  MessageResponse,
  SendMessageRequest,
  ShareMessageRequest,
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

export function useDeleteMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, Error, string>({
    mutationFn: (messageId) => chatService.deleteMessage(messageId),
    onSuccess: (message) => {
      queryClient.setQueryData<MessageResponse[]>(
        chatKeys.messages(message.channelId),
        (oldMessages = []) =>
          oldMessages.map((item) => (item.id === message.id ? message : item)),
      );

      queryClient.invalidateQueries({
        queryKey: chatKeys.channels(),
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
      chatService.updateMessage(messageId, content),
    onSuccess: (message) => {
      queryClient.setQueryData<MessageResponse[]>(
        chatKeys.messages(message.channelId),
        (oldMessages = []) =>
          oldMessages.map((item) => (item.id === message.id ? message : item)),
      );

      queryClient.invalidateQueries({
        queryKey: chatKeys.channels(),
      });
    },
  });
}

export function useShareMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    MessageResponse | { discussionId: string; id: string },
    Error,
    { messageId: string; request: ShareMessageRequest }
  >({
    mutationFn: ({ messageId, request }) =>
      chatService.shareMessage(messageId, request),
    onSuccess: (message) => {
      if ("channelId" in message && message.channelId) {
        queryClient.setQueryData<MessageResponse[]>(
          chatKeys.messages(message.channelId),
          (oldMessages = []) => {
            const alreadyExists = oldMessages.some(
              (item) => item.id === message.id,
            );

            if (alreadyExists) {
              return oldMessages;
            }

            return [...oldMessages, message];
          },
        );

        queryClient.invalidateQueries({
          queryKey: chatKeys.channels(),
        });
        return;
      }

      if ("discussionId" in message && message.discussionId) {
        queryClient.invalidateQueries({
          queryKey: ["discussions"],
        });
      }
    },
  });
}