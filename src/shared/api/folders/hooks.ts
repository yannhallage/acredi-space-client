import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { folderService } from "./service";
import type { CreateFolderRequest, UpdateFolderRequest } from "./types";

export const folderKeys = {
  all: ["folders"] as const,
  lists: () => [...folderKeys.all, "list"] as const,
  list: () => [...folderKeys.lists()] as const,
};

export function useFolders() {
  return useQuery({
    queryKey: folderKeys.list(),
    queryFn: () => folderService.findMine(),
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateFolderRequest) => folderService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateFolderRequest;
    }) => folderService.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => folderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}
