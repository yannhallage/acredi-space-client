import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { chatKeys, writeMessageToCaches } from "./messagesCache";
import { chatService } from "./service";
import type {
  ChannelResponse,
  CreateChannelRequest,
  CreateDirectChannelRequest,
  MessagePageCursor,
  MessagePageResponse,
  MessageResponse,
  SendMessageRequest,
  ShareMessageRequest,
} from "./types";

export { chatKeys } from "./messagesCache";

export function useChannelsQuery(enabled = true) {
  return useQuery<ChannelResponse[]>({
    queryKey: chatKeys.channels(),
    queryFn: () => chatService.findChannels(),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useInfiniteMessagesQuery(channelId?: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(channelId ?? ""),
    queryFn: ({ pageParam }) =>
      chatService.findMessages(channelId!, pageParam),
    enabled: Boolean(channelId),
    initialPageParam: undefined as MessagePageCursor | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || !lastPage.nextBefore) {
        return undefined;
      }

      return {
        before: lastPage.nextBefore,
        beforeId: lastPage.nextBeforeId ?? undefined,
      };
    },
    staleTime: 1000 * 10,
  });
}

export function useMessagesQuery(channelId?: string) {
  const query = useInfiniteMessagesQuery(channelId);

  return {
    ...query,
    data: query.data
      ? query.data.pages
          .slice()
          .reverse()
          .flatMap((page) => page.messages ?? [])
      : undefined,
  };
}

export function useMessagesQueries(channelIds: string[]) {
  return useQueries({
    queries: channelIds.map((channelId) => ({
      queryKey: chatKeys.messagePreview(channelId),
      queryFn: () => chatService.findMessages(channelId),
      enabled: Boolean(channelId),
      staleTime: 1000 * 10,
      select: (page: MessagePageResponse) => page.messages,
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
      writeMessageToCaches(queryClient, message);

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
      writeMessageToCaches(queryClient, message);

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
      writeMessageToCaches(queryClient, message);

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
        writeMessageToCaches(queryClient, message);

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
