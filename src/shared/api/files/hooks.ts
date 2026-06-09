import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fileService } from "./service";
import type { ShareFileRequest, UploadFileRequest } from "./types";

export const fileKeys = {
  all: ["files"] as const,
  lists: () => [...fileKeys.all, "list"] as const,
  list: () => [...fileKeys.lists()] as const,
};

export function useFiles() {
  return useQuery({
    queryKey: fileKeys.list(),
    queryFn: () => fileService.findMine(),
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UploadFileRequest) => fileService.upload(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}

export function useDownloadFileUrl() {
  return useMutation({
    mutationFn: (id: string) => fileService.downloadUrl(id),
  });
}

export function useShareFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: ShareFileRequest;
    }) => fileService.share(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fileService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });





}

  export function useSharedFiles() {
  return useQuery({
    queryKey: ["files", "shared"],
    queryFn: () => fileService.getSharedFiles(),
  });
}