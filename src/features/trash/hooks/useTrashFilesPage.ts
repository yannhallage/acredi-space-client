import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useDeleteFilePermanently,
  useRestoreFile,
  useTrashFiles,
  type WorkspaceFile,
} from "../../../shared/api/files";
import { useFilesViewMode } from "../../files/hooks/useFilesViewMode";
import { pluralizeFile } from "../../files/utils";

const emptyFiles: WorkspaceFile[] = [];

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

export function useTrashFilesPage() {
  const { setViewMode, viewMode } = useFilesViewMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuFileId, setOpenMenuFileId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });

  const {
    data: trashFilesData,
    error: trashFilesError,
    isError,
    isFetching,
    isLoading,
    isPending,
  } = useTrashFiles();
  const restoreFileMutation = useRestoreFile();
  const deletePermanentlyMutation = useDeleteFilePermanently();

  const trashFiles = trashFilesData ?? emptyFiles;
  const isInitialLoading =
    isPending || isLoading || (isFetching && !trashFilesData && !isError);

  const visibleFiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return trashFiles;
    }

    return trashFiles.filter((file) => file.name.toLowerCase().includes(query));
  }, [searchTerm, trashFiles]);

  const showToast = useCallback(
    (intent: ToastState["intent"], message: string, durationMs = 3200) => {
      setToast({ show: true, intent, message });
      window.setTimeout(() => {
        setToast((current) =>
          current.message === message ? { ...current, show: false } : current,
        );
      }, durationMs);
    },
    [],
  );

  useEffect(() => {
    function closeMenusOnOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;

      if (
        target?.closest(".files-file-menu-button") ||
        target?.closest(".files-file-dropdown")
      ) {
        return;
      }

      setOpenMenuFileId(null);
    }

    window.addEventListener("mousedown", closeMenusOnOutsideClick);

    return () => {
      window.removeEventListener("mousedown", closeMenusOnOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!isError) {
      return;
    }

    showToast(
      "error",
      trashFilesError instanceof Error
        ? trashFilesError.message
        : "Impossible de charger la corbeille.",
      5000,
    );
  }, [isError, showToast, trashFilesError]);

  async function handleRestore(file: WorkspaceFile) {
    setOpenMenuFileId(null);

    try {
      await restoreFileMutation.mutateAsync(file.id);
      showToast("success", `"${file.name}" restaure.`);
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de restaurer ce fichier.",
        5000,
      );
    }
  }

  async function handleDeletePermanently(file: WorkspaceFile) {
    setOpenMenuFileId(null);

    if (
      !window.confirm(
        `Supprimer definitivement "${file.name}" ? Cette action est irreversible.`,
      )
    ) {
      return;
    }

    try {
      await deletePermanentlyMutation.mutateAsync(file.id);
      showToast("success", "Fichier supprime definitivement.");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer ce fichier.",
        5000,
      );
    }
  }

  return {
    deletePending: deletePermanentlyMutation.isPending,
    handleDeletePermanently,
    handleRestore,
    isError,
    isInitialLoading,
    openMenuFileId,
    pluralizeFile,
    restorePending: restoreFileMutation.isPending,
    searchTerm,
    setOpenMenuFileId,
    setSearchTerm,
    setViewMode,
    toast,
    trashFilesError,
    viewMode,
    visibleFiles,
  };
}
