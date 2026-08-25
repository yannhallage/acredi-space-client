import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checklistService } from "./service";
import type {
  AddChecklistMemberRequest,
  CreateChecklistItemRequest,
  CreateChecklistRequest,
  MoveChecklistItemRequest,
  UpdateChecklistItemRequest,
  UpdateChecklistRequest,
} from "./types";

export const checklistKeys = {
  all: ["checklists"] as const,
  lists: () => [...checklistKeys.all, "list"] as const,
  detail: (id: string) => [...checklistKeys.all, "detail", id] as const,
};

function invalidateBoard(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: checklistKeys.all });
}

export function useChecklists(enabled = true) {
  return useQuery({
    queryKey: checklistKeys.lists(),
    queryFn: () => checklistService.findAll(),
    enabled,
  });
}

export function useChecklist(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: checklistKeys.detail(id ?? ""),
    queryFn: () => checklistService.findById(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateChecklistRequest) =>
      checklistService.create(request),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateChecklistRequest;
    }) => checklistService.update(id, request),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistService.delete(id),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useAddChecklistMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: AddChecklistMemberRequest;
    }) => checklistService.addMember(id, request),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useRemoveChecklistMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      checklistService.removeMember(id, userId),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useCreateChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: CreateChecklistItemRequest;
    }) => checklistService.createItem(id, request),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      itemId,
      request,
    }: {
      id: string;
      itemId: string;
      request: UpdateChecklistItemRequest;
    }) => checklistService.updateItem(id, itemId, request),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useMoveChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      itemId,
      request,
    }: {
      id: string;
      itemId: string;
      request: MoveChecklistItemRequest;
    }) => checklistService.moveItem(id, itemId, request),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      checklistService.toggleItem(id, itemId),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      checklistService.deleteItem(id, itemId),
    onSuccess: () => invalidateBoard(queryClient),
  });
}
