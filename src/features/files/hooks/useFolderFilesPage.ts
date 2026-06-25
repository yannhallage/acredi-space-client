import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  isSmallFileUpload,
  SMALL_FILE_UPLOAD_MAX_SIZE_LABEL,
  useDeleteFile,
  useDownloadFileUrl,
  useFiles,
  useShareFile,
  useUploadFile,
  type FilePermissionLevel,
  type WorkspaceFile,
} from "../../../shared/api/files";
import { useFolders, type Folder } from "../../../shared/api/folders";
import { useUsersQuery } from "../../../shared/api/users";
import { resolveAssetUrl } from "../../../shared/api/http";
import type { User } from "../../../shared/types";
import { downloadFileFromUrl } from "../../../shared/utils/downloadFile";

import type { PreviewState } from "../filePreview";
import { setCachedFilePreviewUrl } from "../filePreviewUrlCache";
import { buildFolderTrail, pluralizeFile } from "../utils";

const emptyFolders: Folder[] = [];
const emptyFiles: WorkspaceFile[] = [];

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

export function useFolderFilesPage(folderId: string | undefined) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuFileId, setOpenMenuFileId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [shareTargetFile, setShareTargetFile] = useState<WorkspaceFile | null>(null);
  const [shareLevel, setShareLevel] = useState<FilePermissionLevel>("READ");
  const [sharingUserId, setSharingUserId] = useState<string | null>(null);
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
    data: foldersData,
    error: foldersError,
    isError: isFoldersError,
    isFetching: isFoldersFetching,
    isLoading: isFoldersLoading,
    isPending: isFoldersPending,
  } = useFolders();
  const {
    data: filesData,
    error: filesError,
    isError: isFilesError,
    isFetching: isFilesFetching,
    isLoading: isFilesLoading,
    isPending: isFilesPending,
  } = useFiles();
  const uploadFileMutation = useUploadFile();
  const previewFileUrlMutation = useDownloadFileUrl();
  const downloadFileUrlMutation = useDownloadFileUrl();
  const shareFileMutation = useShareFile();
  const deleteFileMutation = useDeleteFile();
  const usersQuery = useUsersQuery({ enabled: Boolean(shareTargetFile) });

  const folders = foldersData ?? emptyFolders;
  const files = filesData ?? emptyFiles;
  const isInitialLoading =
    isFoldersPending ||
    isFoldersLoading ||
    isFilesPending ||
    isFilesLoading ||
    (isFoldersFetching && !foldersData && !isFoldersError) ||
    (isFilesFetching && !filesData && !isFilesError);

  const folderById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders],
  );
  const currentFolder = folderId ? (folderById.get(folderId) ?? null) : null;
  const breadcrumbs = useMemo(
    () => buildFolderTrail(currentFolder, folderById),
    [currentFolder, folderById],
  );
  const visibleFiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return files.filter((file) => {
      const isInFolder = file.folderId === folderId;
      const matchesSearch = !query || file.name.toLowerCase().includes(query);

      return isInFolder && matchesSearch;
    });
  }, [files, folderId, searchTerm]);
  const selectedFile = selectedFileId
    ? (files.find((file) => file.id === selectedFileId) ?? null)
    : null;
  const currentPath = breadcrumbs.map((folder) => folder.name).join("/");

  const showToast = useCallback(
    (intent: ToastState["intent"], message: string, timeout = 4000) => {
      setToast({ show: true, intent, message });

      window.setTimeout(() => {
        setToast((current) => ({ ...current, show: false }));
      }, timeout);
    },
    [],
  );

  useEffect(() => {
    const error = foldersError ?? filesError;

    if (!error || (!isFoldersError && !isFilesError)) {
      return;
    }

    showToast(
      "error",
      error instanceof Error
        ? error.message
        : "Impossible de charger les fichiers.",
      5000,
    );
  }, [filesError, foldersError, isFilesError, isFoldersError, showToast]);

  useEffect(() => {
    if (!openMenuFileId) {
      return undefined;
    }

    function closeMenu() {
      setOpenMenuFileId(null);
    }

    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", closeMenuOnEscape);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, [openMenuFileId]);

  useEffect(() => {
    if (!selectedFileId) {
      return undefined;
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
    if (selectedFileId && !files.some((file) => file.id === selectedFileId)) {
      setSelectedFileId(null);
    }
  }, [files, selectedFileId]);

  async function handleUploadFile(file: globalThis.File) {
    if (!folderId) {
      return;
    }

    if (!isSmallFileUpload(file)) {
      showToast(
        "warning",
        `Ce fichier depasse la limite de ${SMALL_FILE_UPLOAD_MAX_SIZE_LABEL}.`,
        5000,
      );
      return;
    }

    try {
      await uploadFileMutation.mutateAsync({
        file,
        folderId,
        teamId: currentFolder?.teamId ?? null,
        visibility: "PRIVATE",
      });
      showToast("success", "Fichier importe avec succes.");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d'importer le fichier.",
        5000,
      );
    }
  }

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
      const url = await previewFileUrlMutation.mutateAsync(file.id);
      const resolvedUrl = resolveAssetUrl(url) ?? url;

      setCachedFilePreviewUrl(file.id, resolvedUrl);

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

  async function handleDownloadFile(file: WorkspaceFile) {
    setOpenMenuFileId(null);

    try {
      const url = await downloadFileUrlMutation.mutateAsync(file.id);

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

  function handleShareFile(file: WorkspaceFile) {
    setOpenMenuFileId(null);
    setShareLevel("READ");
    setSharingUserId(null);
    setShareTargetFile(file);
  }

  function closeFileShareModal() {
    if (sharingUserId) {
      return;
    }

    setShareTargetFile(null);
    setShareLevel("READ");
    setSharingUserId(null);
  }

  async function shareFileWithUser(user: User) {
    if (!shareTargetFile || sharingUserId) {
      return;
    }

    setSharingUserId(user.id);

    try {
      await shareFileMutation.mutateAsync({
        id: shareTargetFile.id,
        request: {
          level: shareLevel,
          userId: user.id,
        },
      });

      showToast("success", `Fichier partage avec ${user.name}.`);
      setShareTargetFile(null);
      setShareLevel("READ");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de partager ce fichier.",
        5000,
      );
    } finally {
      setSharingUserId(null);
    }
  }

  async function handleDeleteFile(file: WorkspaceFile) {
    setOpenMenuFileId(null);

    if (!window.confirm(`Supprimer le fichier "${file.name}" ?`)) {
      return;
    }

    try {
      await deleteFileMutation.mutateAsync(file.id);
      if (selectedFileId === file.id) {
        setSelectedFileId(null);
      }
      showToast("success", "Fichier supprime avec succes.");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer le fichier.",
        5000,
      );
    }
  }

  return {
    breadcrumbs,
    closeFileShareModal,
    currentFolder,
    currentPath,
    deleteFileMutation,
    downloadFileUrlMutation,
    filesError,
    foldersError,
    handleDeleteFile,
    handleDownloadFile,
    handleOpenPreview,
    handleShareFile,
    handleUploadFile,
    isFilesError,
    isFoldersError,
    isInitialLoading,
    navigate,
    openMenuFileId,
    pluralizeFile,
    preview,
    searchTerm,
    selectedFile,
    setOpenMenuFileId,
    setSearchTerm,
    setSelectedFileId,
    setShareLevel,
    shareFileWithUser,
    shareLevel,
    shareTargetFile,
    sharingUserId,
    toast,
    uploadFileMutation,
    usersQuery,
    visibleFiles,
  };
}
