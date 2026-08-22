import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatKeys, writeMessageToCaches } from "../dm/messagesCache";
import { discussionKeys, writeGroupMessageToCache } from "./messagesCache";
import { discussionService } from "./service";
import type {
  GroupMessagePageCursor,
  GroupMessageResponse,
  SendGroupMessageRequest,
} from "./types";

interface UseDiscussionQueryOptions {
  enabled?: boolean;
}

export { discussionKeys } from "./messagesCache";

export function useMyDiscussions(options: UseDiscussionQueryOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: discussionKeys.mine(),
    queryFn: () => discussionService.findMine(),
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useTeamDiscussions(
  teamId?: string,
  options: UseDiscussionQueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: discussionKeys.byTeam(teamId ?? ""),
    queryFn: () => discussionService.findByTeam(teamId!),
    enabled: enabled && Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useDiscussion(
  discussionId?: string,
  options: UseDiscussionQueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: discussionKeys.detail(discussionId ?? ""),
    queryFn: () => discussionService.findById(discussionId!),
    enabled: enabled && Boolean(discussionId),
    staleTime: 1000 * 15,
  });
}

export function useInfiniteDiscussionMessages(
  discussionId?: string,
  options: UseDiscussionQueryOptions = {}
) {
  const { enabled = true } = options;

  return useInfiniteQuery({
    queryKey: discussionKeys.messages(discussionId ?? ""),
    queryFn: ({ pageParam }) =>
      discussionService.findMessages(discussionId!, pageParam),
    enabled: enabled && Boolean(discussionId),
    initialPageParam: undefined as GroupMessagePageCursor | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || !lastPage.nextBefore) {
        return undefined;
      }

      return {
        before: lastPage.nextBefore,
        beforeId: lastPage.nextBeforeId ?? undefined,
      };
    },
    staleTime: 1000 * 5,
  });
}

export function useDiscussionMessages(
  discussionId?: string,
  options: UseDiscussionQueryOptions = {}
) {
  const query = useInfiniteDiscussionMessages(discussionId, options);

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

export function useSendDiscussionMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      request,
    }: {
      discussionId: string;
      request: SendGroupMessageRequest;
    }) => discussionService.sendMessage(discussionId, request),
    onSuccess: (message) => {
      writeGroupMessageToCache(queryClient, message);
      queryClient.invalidateQueries({ queryKey: discussionKeys.mine() });
    },
  });
}

export function useDeleteDiscussionMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      messageId,
    }: {
      discussionId: string;
      messageId: string;
    }) => discussionService.deleteMessage(discussionId, messageId),
    onSuccess: (message) => {
      writeGroupMessageToCache(queryClient, message);
      queryClient.invalidateQueries({ queryKey: discussionKeys.mine() });
    },
  });
}

export function useUpdateDiscussionMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      messageId,
      content,
    }: {
      discussionId: string;
      messageId: string;
      content: string;
    }) => discussionService.updateMessage(discussionId, messageId, content),
    onSuccess: (message) => {
      writeGroupMessageToCache(queryClient, message);
      queryClient.invalidateQueries({ queryKey: discussionKeys.mine() });
    },
  });
}

export function useShareDiscussionMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      discussionId,
      messageId,
      userId,
      targetDiscussionId,
    }: {
      discussionId: string;
      messageId: string;
      userId?: string;
      targetDiscussionId?: string;
    }) =>
      discussionService.shareMessage(discussionId, messageId, {
        userId,
        discussionId: targetDiscussionId,
      }),
    onSuccess: (message) => {
      if ("channelId" in message && message.channelId) {
        writeMessageToCaches(queryClient, message);

        queryClient.invalidateQueries({
          queryKey: chatKeys.channels(),
        });
        return;
      }

      if ("discussionId" in message && message.discussionId) {
        writeGroupMessageToCache(queryClient, message as GroupMessageResponse);
        queryClient.invalidateQueries({ queryKey: discussionKeys.mine() });
      }
    },
  });
}