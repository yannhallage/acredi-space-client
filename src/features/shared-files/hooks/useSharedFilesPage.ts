import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useDownloadFileUrl,
  useSharedFiles,
  type WorkspaceFile,
} from "../../../shared/api/files";
import { useUsersQuery } from "../../../shared/api/users";
import { resolveAssetUrl } from "../../../shared/api/http";
import { useAuth } from "../../../shared/context";
import type { User } from "../../../shared/types";
import { downloadFileFromUrl } from "../../../shared/utils/downloadFile";
import type { PreviewState } from "../../files/filePreview";
import { cacheFilePreviewUrl } from "../../files/filePreviewUrlCache";
import { useFilesViewMode } from "../../files/hooks/useFilesViewMode";
import { pluralizeFile } from "../../files/utils";

const emptyFiles: WorkspaceFile[] = [];

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

export function useSharedFilesPage() {
  const { user } = useAuth();
  const { setViewMode, viewMode } = useFilesViewMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuFileId, setOpenMenuFileId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>({
    error: null,
    fileId: null,
    loading: false,
    url: null,
  });
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });

  const {
    data: sharedFilesData,
    error: sharedFilesError,
    isError: isSharedFilesError,
    isFetching: isSharedFilesFetching,
    isLoading: isSharedFilesLoading,
    isPending: isSharedFilesPending,
  } = useSharedFiles();
  const usersQuery = useUsersQuery();
  const previewSharedFileUrlMutation = useDownloadFileUrl();
  const downloadSharedFileUrlMutation = useDownloadFileUrl();

  const sharedFiles = sharedFilesData ?? emptyFiles;
  const isInitialLoading =
    isSharedFilesPending ||
    isSharedFilesLoading ||
    (isSharedFilesFetching && !sharedFilesData && !isSharedFilesError);

  const ownerById = useMemo(() => {
    const map = new Map<string, User>();

    (usersQuery.data ?? []).forEach((entry) => {
      map.set(entry.id, entry);
    });

    return map;
  }, [usersQuery.data]);

  const ownerNameById = useMemo(() => {
    const map = new Map<string, string>();

    ownerById.forEach((entry, id) => {
      map.set(id, entry.email || entry.name);
    });

    if (user) {
      map.set(user.id, "moi");
    }

    return map;
  }, [ownerById, user]);

  const visibleFiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return sharedFiles;
    }

    return sharedFiles.filter((file) =>
      file.name.toLowerCase().includes(query),
    );
  }, [searchTerm, sharedFiles]);

  const selectedFile = selectedFileId
    ? (sharedFiles.find((file) => file.id === selectedFileId) ?? null)
    : null;

  const showToast = useCallback(
    (
      intent: ToastState["intent"],
      message: string,
      durationMs = 3200,
    ) => {
      setToast({ show: true, intent, message });
      window.setTimeout(() => {
        setToast((current) =>
          current.message === message ? { ...current, show: false } : current,
        );
      }, durationMs);
    },
    [],
  );

  const getOwnerLabel = useCallback(
    (file: WorkspaceFile) => {
      if (!file.ownerId) {
        return "—";
      }

      return ownerNameById.get(file.ownerId) ?? "Utilisateur";
    },
    [ownerNameById],
  );

  const getOwnerUser = useCallback(
    (file: WorkspaceFile) => {
      if (!file.ownerId) {
        return null;
      }

      return ownerById.get(file.ownerId) ?? null;
    },
    [ownerById],
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
    if (!selectedFileId) {
      return;
    }

    function closePreviewOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedFileId(null);
      }
    }

    window.addEventListener("keydown", closePreviewOnEscape);

    return () => {
      window.removeEventListener("keydown", closePreviewOnEscape);
    };
  }, [selectedFileId]);

  useEffect(() => {
    if (
      selectedFileId &&
      !sharedFiles.some((file) => file.id === selectedFileId)
    ) {
      setSelectedFileId(null);
    }
  }, [selectedFileId, sharedFiles]);

  useEffect(() => {
    if (!isSharedFilesError) {
      return;
    }

    showToast(
      "error",
      sharedFilesError instanceof Error
        ? sharedFilesError.message
        : "Impossible de charger les fichiers partages.",
      5000,
    );
  }, [isSharedFilesError, sharedFilesError, showToast]);

  async function handleOpenPreview(file: WorkspaceFile) {
    setOpenMenuFileId(null);
    setSelectedFileId(file.id);
    setPreview({
      error: null,
      fileId: file.id,
      loading: true,
      url: null,
    });

    try {
      const url = await previewSharedFileUrlMutation.mutateAsync(file.id);
      const resolvedUrl = await cacheFilePreviewUrl(
        file.id,
        resolveAssetUrl(url) ?? url,
      );

      setPreview((current) =>
        current.fileId === file.id
          ? {
              error: null,
              fileId: file.id,
              loading: false,
              url: resolvedUrl,
            }
          : current,
      );
    } catch (caughtError) {
      setPreview((current) =>
        current.fileId === file.id
          ? {
              error:
                caughtError instanceof Error
                  ? caughtError.message
                  : "Impossible de charger l'apercu.",
              fileId: file.id,
              loading: false,
              url: null,
            }
          : current,
      );
    }
  }

  async function handleDownload(file: WorkspaceFile) {
    setOpenMenuFileId(null);

    try {
      const url = await downloadSharedFileUrlMutation.mutateAsync(file.id);

      if (!url) {
        showToast("error", "Lien de telechargement introuvable.", 5000);
        return;
      }

      await downloadFileFromUrl(url, file.name);
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de telecharger ce fichier.",
        5000,
      );
    }
  }

  return {
    downloadPending: downloadSharedFileUrlMutation.isPending,
    getOwnerLabel,
    getOwnerUser,
    handleDownload,
    handleOpenPreview,
    isError: isSharedFilesError,
    isInitialLoading,
    openMenuFileId,
    pluralizeFile,
    preview,
    searchTerm,
    selectedFile,
    setOpenMenuFileId,
    setSearchTerm,
    setSelectedFileId,
    setViewMode,
    sharedFilesError,
    toast,
    viewMode,
    visibleFiles,
  };
}
