import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { discussionService } from "./service";
import type { SendGroupMessageRequest } from "./types";

interface UseDiscussionQueryOptions {
  enabled?: boolean;
}

export const discussionKeys = {
  all: ["discussions"] as const,
  mine: () => [...discussionKeys.all, "mine"] as const,
  byTeam: (teamId: string) => [...discussionKeys.all, "team", teamId] as const,
  detail: (id: string) => [...discussionKeys.all, "detail", id] as const,
  messages: (discussionId: string) =>
    [...discussionKeys.all, "messages", discussionId] as const,
};

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

export function useDiscussionMessages(
  discussionId?: string,
  options: UseDiscussionQueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: discussionKeys.messages(discussionId ?? ""),
    queryFn: () => discussionService.findMessages(discussionId!),
    enabled: enabled && Boolean(discussionId),
    refetchInterval: 15_000,
    staleTime: 1000 * 5,
  });
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
      queryClient.invalidateQueries({
        queryKey: discussionKeys.messages(message.discussionId),
      });
      queryClient.invalidateQueries({ queryKey: discussionKeys.mine() });
    },
  });
}
