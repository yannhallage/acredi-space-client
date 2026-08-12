import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pollService } from "./service";
import type {
  CreatePollRequest,
  InvitePollParticipantsRequest,
  PollListParams,
  SubmitPollResponseRequest,
  UpdateParticipantStatusRequest,
  UpdatePollRequest,
} from "./types";

interface UsePollsOptions {
  enabled?: boolean;
}

export const pollKeys = {
  all: ["polls"] as const,
  lists: () => [...pollKeys.all, "list"] as const,
  list: (params?: PollListParams) => [...pollKeys.lists(), params] as const,
  details: () => [...pollKeys.all, "detail"] as const,
  detail: (id: string) => [...pollKeys.details(), id] as const,
  results: (id: string) => [...pollKeys.detail(id), "results"] as const,
  stats: (id: string) => [...pollKeys.detail(id), "stats"] as const,
  myResponse: (id: string) => [...pollKeys.detail(id), "my-response"] as const,
};

function invalidatePollQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string
) {
  queryClient.invalidateQueries({ queryKey: pollKeys.lists() });
  if (id) {
    queryClient.invalidateQueries({ queryKey: pollKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: pollKeys.results(id) });
    queryClient.invalidateQueries({ queryKey: pollKeys.stats(id) });
    queryClient.invalidateQueries({ queryKey: pollKeys.myResponse(id) });
  }
}

export function usePolls(
  params?: PollListParams,
  options: UsePollsOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: pollKeys.list(params),
    queryFn: () => pollService.findAll(params),
    enabled,
  });
}

export function usePoll(id?: string) {
  return useQuery({
    queryKey: pollKeys.detail(id ?? ""),
    queryFn: () => pollService.findById(id!),
    enabled: Boolean(id),
  });
}

export function usePollResults(id?: string, enabled = true) {
  return useQuery({
    queryKey: pollKeys.results(id ?? ""),
    queryFn: () => pollService.getResults(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function usePollStats(id?: string, enabled = true) {
  return useQuery({
    queryKey: pollKeys.stats(id ?? ""),
    queryFn: () => pollService.getStats(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function useMyPollResponse(id?: string, enabled = true) {
  return useQuery({
    queryKey: pollKeys.myResponse(id ?? ""),
    queryFn: () => pollService.getMyResponse(id!),
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePollRequest) => pollService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() });
    },
  });
}

export function useUpdatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdatePollRequest;
    }) => pollService.update(id, request),
    onSuccess: (poll) => {
      invalidatePollQueries(queryClient, poll.id);
    },
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pollService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() });
      queryClient.removeQueries({ queryKey: pollKeys.detail(id) });
    },
  });
}

export function usePublishPoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pollService.publish(id),
    onSuccess: (poll) => {
      invalidatePollQueries(queryClient, poll.id);
    },
  });
}

export function useClosePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pollService.close(id),
    onSuccess: (poll) => {
      invalidatePollQueries(queryClient, poll.id);
    },
  });
}

export function useArchivePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pollService.archive(id),
    onSuccess: (poll) => {
      invalidatePollQueries(queryClient, poll.id);
    },
  });
}

export function useInvitePollParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: InvitePollParticipantsRequest;
    }) => pollService.inviteParticipants(id, request),
    onSuccess: (poll) => {
      invalidatePollQueries(queryClient, poll.id);
    },
  });
}

export function useUpdatePollParticipantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      userId,
      request,
    }: {
      id: string;
      userId: string;
      request: UpdateParticipantStatusRequest;
    }) => pollService.updateParticipantStatus(id, userId, request),
    onSuccess: (poll) => {
      invalidatePollQueries(queryClient, poll.id);
    },
  });
}

export function useSubmitPollResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: SubmitPollResponseRequest;
    }) => pollService.submitResponse(id, request),
    onSuccess: (_, { id }) => {
      invalidatePollQueries(queryClient, id);
    },
  });
}

export function useUpdatePollResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: SubmitPollResponseRequest;
    }) => pollService.updateResponse(id, request),
    onSuccess: (_, { id }) => {
      invalidatePollQueries(queryClient, id);
    },
  });
}
