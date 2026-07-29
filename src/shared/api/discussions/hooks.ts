import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "../dm/hooks";
import type { MessageResponse } from "../dm/types";
import { discussionService } from "./service";
import type {
  GroupMessageResponse,
  SendGroupMessageRequest,
  UpdateGroupMessageRequest,
} from "./types";

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


function replaceMessageInCache(
  oldMessages: GroupMessageResponse[] | undefined,
  updatedMessage: GroupMessageResponse
) {
  if (!oldMessages) {
    return oldMessages;
  }

  return oldMessages.map((message) =>
    message.id === updatedMessage.id ? updatedMessage : message
  );
}

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
      queryClient.setQueryData<GroupMessageResponse[]>(
        discussionKeys.messages(message.discussionId),
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
      queryClient.setQueryData<GroupMessageResponse[]>(
        discussionKeys.messages(message.discussionId),
        (oldMessages = []) =>
          oldMessages.map((item) => (item.id === message.id ? message : item)),
      );
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
      queryClient.setQueryData<GroupMessageResponse[]>(
        discussionKeys.messages(message.discussionId),
        (oldMessages = []) =>
          oldMessages.map((item) => (item.id === message.id ? message : item)),
      );
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
      request,
    }: {
      discussionId: string;
      messageId: string;
      request: UpdateGroupMessageRequest;
    }) => discussionService.updateMessage(discussionId, messageId, request),

    onSuccess: (updatedMessage) => {
      queryClient.setQueryData<GroupMessageResponse[]>(
        discussionKeys.messages(updatedMessage.discussionId),
        (oldMessages) => replaceMessageInCache(oldMessages, updatedMessage)
      );

      queryClient.invalidateQueries({
        queryKey: discussionKeys.messages(updatedMessage.discussionId),
      });
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

    onSuccess: (deletedMessage) => {
      queryClient.setQueryData<GroupMessageResponse[]>(
        discussionKeys.messages(deletedMessage.discussionId),
        (oldMessages) => replaceMessageInCache(oldMessages, deletedMessage)
      );

      queryClient.invalidateQueries({
        queryKey: discussionKeys.messages(deletedMessage.discussionId),
      });

      queryClient.invalidateQueries({
        queryKey: discussionKeys.mine(),
      });
    },
  });
}
