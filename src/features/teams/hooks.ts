import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamService } from "./services";

import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  UpdateTeamRequest,
} from "./types";

export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: () => [...teamKeys.lists()] as const,
  myList: () => [...teamKeys.lists(), "mine"] as const,
  members: (teamId: string) => [...teamKeys.all, "members", teamId] as const,
};

interface UseTeamsOptions {
  enabled?: boolean;
}

export function useTeams(options: UseTeamsOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: teamKeys.list(),
    queryFn: () => teamService.findAll(),
    enabled,
  });
}

export function useMyTeams(options: UseTeamsOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: teamKeys.myList(),
    queryFn: () => teamService.findMine(),
    enabled,
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: () => teamService.findMembers(teamId),
    enabled: Boolean(teamId),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTeamRequest) => teamService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.myList() });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateTeamRequest;
    }) => teamService.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      request,
    }: {
      teamId: string;
      request: AddTeamMemberRequest;
    }) => teamService.addMember(teamId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.myList() });
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(variables.teamId),
      });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.myList() });
    },
  });
}
