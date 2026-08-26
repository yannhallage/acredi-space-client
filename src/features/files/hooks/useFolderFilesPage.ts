import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
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
import { useFolders, useCreateFolder, useUpdateFolder, useDeleteFolder, type Folder } from "../../../shared/api/folders";
import { useUsersQuery } from "../../../shared/api/users";
import {
  feedback,
  getFriendlyErrorMessage,
  resolveActionFeedback,
} from "../../../shared/feedback";
import type { User } from "../../../shared/types";
import { downloadFileFromUrl } from "../../../shared/utils/downloadFile";

import { buildFolderStatsMap, buildFolderTrail, getFolderBranchIds, pluralizeFile } from "../utils";
import { useFilePreviewLoader } from "./useFilePreviewLoader";

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
  const [openMenuFolderId, setOpenMenuFolderId] = useState<string | null>(null);
  const [shareTargetFile, setShareTargetFile] = useState<WorkspaceFile | null>(null);
  const [shareTargetFolder, setShareTargetFolder] = useState<Folder | null>(null);
  const [shareLevel, setShareLevel] = useState<FilePermissionLevel>("READ");
  const [sharingUserId, setSharingUserId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderName, setFolderName] = useState("");
  const {
    openPreview,
    preview,
    selectedFileId,
    setSelectedFileId,
  } = useFilePreviewLoader();
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
  const downloadFileUrlMutation = useDownloadFileUrl();
  const shareFileMutation = useShareFile();
  const deleteFileMutation = useDeleteFile();
  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();
  const usersQuery = useUsersQuery({
    enabled: Boolean(shareTargetFile || shareTargetFolder),
  });

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
  const visibleFolders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return folders.filter((folder) => {
      const isChild = folder.parentId === folderId;
      const matchesSearch = !query || folder.name.toLowerCase().includes(query);

      return isChild && matchesSearch;
    });
  }, [folderId, folders, searchTerm]);
  const folderStatsById = useMemo(
    () => buildFolderStatsMap(files, folders),
    [files, folders],
  );
  const shareTargetFolderFiles = useMemo(() => {
    if (!shareTargetFolder) {
      return emptyFiles;
    }

    const branchIds = getFolderBranchIds(shareTargetFolder.id, folders);

    return files.filter((file) => file.folderId && branchIds.has(file.folderId));
  }, [files, folders, shareTargetFolder]);
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
      getFriendlyErrorMessage(error, "Impossible de charger les fichiers."),
      5000,
    );
  }, [filesError, foldersError, isFilesError, isFoldersError, showToast]);

  useEffect(() => {
    if (!openMenuFileId && !openMenuFolderId) {
      return undefined;
    }

    function closeMenu() {
      setOpenMenuFileId(null);
      setOpenMenuFolderId(null);
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
  }, [openMenuFileId, openMenuFolderId]);

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

  const handleOpenPreview = useCallback(
    async (file: WorkspaceFile) => {
      setOpenMenuFileId(null);
      await openPreview(file);
    },
    [openPreview],
  );

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
    setShareTargetFolder(null);
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

    if (!window.confirm(`Supprimer "${file.name}" ?\nLe fichier sera deplace dans la corbeille.`)) {
      return;
    }

    try {
      await deleteFileMutation.mutateAsync(file.id);
      if (selectedFileId === file.id) {
        setSelectedFileId(null);
      }
      showToast("success", "Fichier deplace dans la corbeille.");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de deplacer ce fichier dans la corbeille.",
        5000,
      );
    }
  }

  const isFolderSaving =
    createFolderMutation.isPending || updateFolderMutation.isPending;
  const isFolderModalOpen = createModalOpen || Boolean(editingFolder);
  const folderModalTitle = editingFolder
    ? "Modifier le dossier"
    : "Creer un dossier";
  const folderSubmitLabel = editingFolder ? "Modifier" : "Creer";
  const folderSavingLabel = editingFolder ? "Modification..." : "Creation...";
  const folderFormError =
    createFolderMutation.isError || updateFolderMutation.isError
      ? resolveActionFeedback(
          createFolderMutation.error ?? updateFolderMutation.error,
          feedback(
            "error",
            editingFolder ? "Modification impossible" : "Création impossible",
            editingFolder
              ? "Nous n’avons pas pu modifier ce dossier. Réessayez dans un moment."
              : "Nous n’avons pas pu créer ce dossier. Réessayez dans un moment.",
          ),
        )
      : null;

  function openCreateModal() {
    setEditingFolder(null);
    setFolderName("");
    createFolderMutation.reset();
    updateFolderMutation.reset();
    setCreateModalOpen(true);
  }

  function openEditModal(folder: Folder) {
    setOpenMenuFolderId(null);
    setCreateModalOpen(false);
    setEditingFolder(folder);
    setFolderName(folder.name);
    createFolderMutation.reset();
    updateFolderMutation.reset();
  }

  function closeFolderModal() {
    if (isFolderSaving) {
      return;
    }

    setCreateModalOpen(false);
    setEditingFolder(null);
    setFolderName("");
    createFolderMutation.reset();
    updateFolderMutation.reset();
  }

  function handleShareFolder(folder: Folder) {
    setOpenMenuFolderId(null);
    setShareTargetFile(null);
    setShareLevel("READ");
    setSharingUserId(null);
    setShareTargetFolder(folder);
  }

  function closeFolderShareModal() {
    if (sharingUserId) {
      return;
    }

    setShareTargetFolder(null);
    setShareLevel("READ");
    setSharingUserId(null);
  }

  async function shareFolderWithUser(user: User) {
    if (!shareTargetFolder || sharingUserId) {
      return;
    }

    if (shareTargetFolderFiles.length === 0) {
      showToast(
        "warning",
        `Aucun fichier a partager dans "${shareTargetFolder.name}".`,
        5000,
      );
      return;
    }

    setSharingUserId(user.id);

    try {
      await Promise.all(
        shareTargetFolderFiles.map((file) =>
          shareFileMutation.mutateAsync({
            id: file.id,
            request: {
              level: shareLevel,
              userId: user.id,
            },
          }),
        ),
      );

      showToast(
        "success",
        `${shareTargetFolderFiles.length} fichier${shareTargetFolderFiles.length > 1 ? "s" : ""} partage${shareTargetFolderFiles.length > 1 ? "s" : ""} avec ${user.name}.`,
      );
      setShareTargetFolder(null);
      setShareLevel("READ");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de partager ce dossier.",
        5000,
      );
    } finally {
      setSharingUserId(null);
    }
  }

  async function handleDeleteFolder(folder: Folder) {
    setOpenMenuFolderId(null);

    if (!window.confirm(`Supprimer le dossier "${folder.name}" ?`)) {
      return;
    }

    try {
      await deleteFolderMutation.mutateAsync(folder.id);
      showToast("success", "Dossier supprime avec succes.");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de supprimer le dossier.",
        5000,
      );
    }
  }

  async function handleSaveFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = folderName.trim();

    if (!name) {
      return;
    }

    try {
      if (editingFolder) {
        await updateFolderMutation.mutateAsync({
          id: editingFolder.id,
          request: { name },
        });
        showToast("success", "Dossier modifie avec succes.");
      } else {
        await createFolderMutation.mutateAsync({
          name,
          parentId: folderId ?? null,
          teamId: currentFolder?.teamId ?? null,
        });
        showToast("success", "Dossier cree avec succes.");
      }

      closeFolderModal();
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : editingFolder
            ? "Impossible de modifier le dossier."
            : "Impossible de creer le dossier.",
        5000,
      );
    }
  }

  return {
    breadcrumbs,
    closeFileShareModal,
    closeFolderModal,
    closeFolderShareModal,
    currentFolder,
    currentPath,
    deleteFileMutation,
    deleteFolderMutation,
    downloadFileUrlMutation,
    filesError,
    folderFormError,
    folderModalTitle,
    folderName,
    folderSavingLabel,
    folderStatsById,
    folderSubmitLabel,
    foldersError,
    handleDeleteFile,
    handleDeleteFolder,
    handleDownloadFile,
    handleOpenPreview,
    handleSaveFolder,
    handleShareFile,
    handleShareFolder,
    handleUploadFile,
    isFilesError,
    isFolderModalOpen,
    isFolderSaving,
    isFoldersError,
    isInitialLoading,
    navigate,
    openCreateModal,
    openEditModal,
    openMenuFileId,
    openMenuFolderId,
    pluralizeFile,
    preview,
    searchTerm,
    selectedFile,
    setFolderName,
    setOpenMenuFileId,
    setOpenMenuFolderId,
    setSearchTerm,
    setSelectedFileId,
    setShareLevel,
    shareFileWithUser,
    shareFolderWithUser,
    shareLevel,
    shareTargetFile,
    shareTargetFolder,
    shareTargetFolderFiles,
    sharingUserId,
    toast,
    uploadFileMutation,
    usersQuery,
    visibleFiles,
    visibleFolders,
  };
}
