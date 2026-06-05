// hooks.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { noteService } from "./service";
import type {
  CreateNoteRequest,
  ShareNoteRequest,
  UpdateNoteRequest,
} from "./type";

interface UseNotesOptions {
  enabled?: boolean;
}

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (params?: { archived?: boolean; q?: string }) =>
    [...noteKeys.lists(), params] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
  versions: (id: string) => [...noteKeys.detail(id), "versions"] as const,
};

export function useNotes(
  params?: { archived?: boolean; q?: string },
  options: UseNotesOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: () => noteService.findAll(params),
    enabled,
  });
}

export function useNote(id?: string) {
  return useQuery({
    queryKey: noteKeys.detail(id ?? ""),
    queryFn: () => noteService.findById(id!),
    enabled: Boolean(id),
  });
}

export function useNoteVersions(id?: string) {
  return useQuery({
    queryKey: noteKeys.versions(id ?? ""),
    queryFn: () => noteService.findVersions(id!),
    enabled: Boolean(id),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateNoteRequest) => noteService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateNoteRequest;
    }) => noteService.update(id, request),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(note.id) });
      queryClient.invalidateQueries({ queryKey: noteKeys.versions(note.id) });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export function useArchiveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteService.archive(id),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(note.id) });
    },
  });
}

export function useRestoreNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteService.restore(id),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(note.id) });
    },
  });
}

export function usePinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteService.pin(id),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(note.id) });
    },
  });
}

export function useUnpinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteService.unpin(id),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(note.id) });
    },
  });
}

export function useShareNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: ShareNoteRequest;
    }) => noteService.share(id, request),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(note.id) });
    },
  });
}
