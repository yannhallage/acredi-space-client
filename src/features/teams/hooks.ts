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
};

export function useTeams() {
  return useQuery({
    queryKey: teamKeys.list(),
    queryFn: () => teamService.findAll(),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTeamRequest) => teamService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}