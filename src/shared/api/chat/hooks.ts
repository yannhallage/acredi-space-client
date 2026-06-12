import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "./service";
import type { SendMessageRequest } from "./types";

interface UseChatQueryOptions {
  enabled?: boolean;
}

export const chatKeys = {
  all: ["chat"] as const,
  channels: () => [...chatKeys.all, "channels"] as const,
  messages: (channelId: string) =>
    [...chatKeys.all, "messages", channelId] as const,
};

export function useChatChannels(options: UseChatQueryOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: chatKeys.channels(),
    queryFn: () => chatService.findChannels(),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useChatMessages(
  channelId?: string,
  options: UseChatQueryOptions = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: chatKeys.messages(channelId ?? ""),
    queryFn: () => chatService.findMessages(channelId!),
    enabled: enabled && Boolean(channelId),
    refetchInterval: 15_000,
    staleTime: 1000 * 5,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendMessageRequest) => chatService.send(request),
    onSuccess: (message) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(message.channelId),
      });
    },
  });
}
