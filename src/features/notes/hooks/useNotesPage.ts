import { useEffect, useMemo, useState } from "react";

import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useShareNote,
  useUpdateNote,
} from "../../../shared/api/notes";
import { useUsersQuery } from "../../../shared/api/users";
import type { User } from "../../../shared/types";

import {
  mapApiNoteToCard,
  noteColors,
  type NoteCardModel,
  type SortMode,
} from "../utils";

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

export function useNotesPage() {
  const notesQueryParams = useMemo(() => ({ archived: false }), []);
  const {
    data: apiNotes,
    error,
    isError,
    isFetching,
    isLoading,
    isPending,
    refetch,
  } = useNotes(notesQueryParams);
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const shareNoteMutation = useShareNote();
  const updateNoteMutation = useUpdateNote();

  const [titleFilter, setTitleFilter] = useState("");
  const [contentFilter, setContentFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [shareTargetNote, setShareTargetNote] = useState<NoteCardModel | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteCardModel | null>(null);
  const [sharingUserId, setSharingUserId] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteCardModel | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftColor, setDraftColor] = useState(noteColors[0]);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });
  const usersQuery = useUsersQuery({ enabled: Boolean(shareTargetNote) });

  const notes = useMemo(
    () => (apiNotes ? apiNotes.map(mapApiNoteToCard) : []),
    [apiNotes],
  );
  const isNotesInitialLoading =
    isPending || isLoading || (isFetching && !apiNotes);
  const isNotesLoading = isPending || isLoading || isFetching;
  const isEditing = Boolean(editingNote);
  const isSavingNote =
    createNoteMutation.isPending || updateNoteMutation.isPending;
  const isSharingNote = shareNoteMutation.isPending;

  const visibleNotes = useMemo(() => {
    const titleQuery = titleFilter.trim().toLowerCase();
    const contentQuery = contentFilter.trim().toLowerCase();

    return notes
      .filter((note) => {
        const matchesTitle =
          titleQuery.length === 0 ||
          note.title.toLowerCase().includes(titleQuery);
        const matchesContent =
          contentQuery.length === 0 ||
          note.content.toLowerCase().includes(contentQuery);

        return matchesTitle && matchesContent;
      })
      .slice()
      .sort((a, b) =>
        sortMode === "newest"
          ? a.updatedMinutes - b.updatedMinutes
          : b.updatedMinutes - a.updatedMinutes,
      );
  }, [contentFilter, notes, sortMode, titleFilter]);

  useEffect(() => {
    if (!isNoteModalOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSavingNote) {
        setIsNoteModalOpen(false);
        setEditingNote(null);
        resetDraft();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isNoteModalOpen, isSavingNote]);

  function showToast(
    intent: ToastState["intent"],
    message: string,
    timeout = 4000,
  ) {
    setToast({ show: true, intent, message });

    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, timeout);
  }

  function resetDraft() {
    setDraftTitle("");
    setDraftContent("");
    setDraftColor(noteColors[0]);
  }

  function openCreateModal() {
    setEditingNote(null);
    resetDraft();
    setIsNoteModalOpen(true);
  }

  function openEditModal(note: NoteCardModel) {
    setEditingNote(note);
    setDraftTitle(note.title);
    setDraftContent(note.content);
    setDraftColor(note.color ?? note.displayColor ?? noteColors[0]);
    setIsNoteModalOpen(true);
  }

  function openShareModal(note: NoteCardModel) {
    setSharingUserId(null);
    setShareTargetNote(note);
  }

  function openViewModal(note: NoteCardModel) {
    setViewingNote(note);
  }

  function closeViewModal() {
    setViewingNote(null);
  }

  function closeShareModal() {
    if (isSharingNote) return;

    setSharingUserId(null);
    setShareTargetNote(null);
  }

  function closeNoteModal() {
    if (isSavingNote) return;

    setIsNoteModalOpen(false);
    setEditingNote(null);
    resetDraft();
  }

  async function saveNote() {
    const title = draftTitle.trim();
    const content = draftContent.trim();

    if (!title) return;

    try {
      if (editingNote) {
        await updateNoteMutation.mutateAsync({
          id: editingNote.id,
          request: {
            title,
            content: content || "No content yet.",
            color: draftColor,
          },
        });
        showToast("success", "Note updated.");
      } else {
        await createNoteMutation.mutateAsync({
          title,
          content: content || "No content yet.",
          color: draftColor,
        });
        showToast("success", "Note created successfully.");
      }

      setIsNoteModalOpen(false);
      setEditingNote(null);
      resetDraft();
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : editingNote
            ? "Error while updating the note."
            : "Error while creating the note.",
        5000,
      );
    }
  }

  async function shareNoteWithUser(user: User) {
    if (!shareTargetNote || isSharingNote) return;

    setSharingUserId(user.id);

    try {
      await shareNoteMutation.mutateAsync({
        id: shareTargetNote.id,
        request: {
          userId: user.id,
          level: "READ",
        },
      });

      showToast("success", `Note shared with ${user.name}.`);
      setShareTargetNote(null);
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Error while sharing the note.",
        5000,
      );
    } finally {
      setSharingUserId(null);
    }
  }

  async function deleteNote(id: string) {
    setDeletingIds((current) => new Set(current).add(id));

    try {
      await deleteNoteMutation.mutateAsync(id);
      showToast("success", "Note deleted.");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Error while deleting the note.",
        5000,
      );
    } finally {
      setDeletingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  async function refreshNotes() {
    const result = await refetch();

    if (result.error) {
      showToast("error", result.error.message, 5000);
    }
  }

  function toggleSortMode() {
    setSortMode((current) => (current === "newest" ? "oldest" : "newest"));
  }

  return {
    closeNoteModal,
    closeShareModal,
    closeViewModal,
    contentFilter,
    createNoteMutation,
    deletingIds,
    draftColor,
    draftContent,
    draftTitle,
    error,
    isEditing,
    isError,
    isFetching,
    isLoading,
    isNoteModalOpen,
    isNotesInitialLoading,
    isNotesLoading,
    isSavingNote,
    isSharingNote,
    openCreateModal,
    openEditModal,
    openShareModal,
    openViewModal,
    refreshNotes,
    saveNote,
    setContentFilter,
    setDraftColor,
    setDraftContent,
    setDraftTitle,
    setTitleFilter,
    shareNoteWithUser,
    shareTargetNote,
    sharingUserId,
    titleFilter,
    toast,
    toggleSortMode,
    usersQuery,
    viewingNote,
    visibleNotes,
    deleteNote,
  };
}
