import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  useDownloadFileUrl,
  useFiles,
  useShareFile,
  useSharedFiles,
  type FilePermissionLevel,
  type WorkspaceFile,
} from "../../../shared/api/files";
import {
  useCreateFolder,
  useDeleteFolder,
  useFolders,
  useUpdateFolder,
  type Folder,
} from "../../../shared/api/folders";
import { useUsersQuery } from "../../../shared/api/users";
import { resolveAssetUrl } from "../../../shared/api/http";
import type { User } from "../../../shared/types";
import { downloadFileFromUrl } from "../../../shared/utils/downloadFile";

import type { PreviewState } from "../filePreview";
import { cacheFilePreviewUrl } from "../filePreviewUrlCache";
import {
  buildFolderTrail,
  getFolderBranchIds,
  pluralizeFolder,
} from "../utils";

const emptyFolders: Folder[] = [];
const emptyFiles: WorkspaceFile[] = [];

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

export function useFilesPage() {
  const navigate = useNavigate();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [shareTargetFolder, setShareTargetFolder] = useState<Folder | null>(null);
  const [shareLevel, setShareLevel] = useState<FilePermissionLevel>("READ");
  const [sharingUserId, setSharingUserId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [openMenuFolderId, setOpenMenuFolderId] = useState<string | null>(null);
  const [openSharedFileMenuId, setOpenSharedFileMenuId] = useState<string | null>(null);
  const [selectedSharedFileId, setSelectedSharedFileId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>({
    error: null,
    fileId: null,
    loading: false,
    url: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });

  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();
  const shareFileMutation = useShareFile();
  const previewSharedFileUrlMutation = useDownloadFileUrl();
  const downloadSharedFileUrlMutation = useDownloadFileUrl();

  const {
    data: filesData,
    error: filesError,
    isError: isFilesError,
    isFetching: isFilesFetching,
    isLoading: isFilesLoading,
    isPending: isFilesPending,
  } = useFiles();
  const {
    data: foldersData,
    error,
    isError,
    isFetching,
    isLoading,
    isPending,
  } = useFolders();
  const {
    data: sharedFilesData,
    error: sharedFilesError,
    isError: isSharedFilesError,
    isFetching: isSharedFilesFetching,
    isLoading: isSharedFilesLoading,
    isPending: isSharedFilesPending,
  } = useSharedFiles();
  const usersQuery = useUsersQuery({ enabled: Boolean(shareTargetFolder) });

  const folders = foldersData ?? emptyFolders;
  const files = filesData ?? emptyFiles;
  const sharedFiles = sharedFilesData ?? emptyFiles;
  const isFoldersInitialLoading =
    isPending || isLoading || (isFetching && !foldersData && !isError);
  const isSharedFilesInitialLoading =
    isSharedFilesPending ||
    isSharedFilesLoading ||
    (isSharedFilesFetching && !sharedFilesData && !isSharedFilesError);
  const isFilesInitialLoading =
    isFilesPending || isFilesLoading || (isFilesFetching && !filesData && !isFilesError);

  const folderById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders],
  );

  const currentFolder = currentFolderId
    ? (folderById.get(currentFolderId) ?? null)
    : null;

  const breadcrumbs = useMemo(
    () => buildFolderTrail(currentFolder, folderById),
    [currentFolder, folderById],
  );

  const visibleFolders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return folders.filter((folder) => {
      const isInCurrentFolder =
        (folder.parentId ?? null) === (currentFolder?.id ?? null);
      const matchesSearch = !query || folder.name.toLowerCase().includes(query);

      return isInCurrentFolder && matchesSearch;
    });
  }, [currentFolder, folders, searchTerm]);

  const selectedSharedFile = selectedSharedFileId
    ? (sharedFiles.find((file) => file.id === selectedSharedFileId) ?? null)
    : null;

  const shareTargetFiles = useMemo(() => {
    if (!shareTargetFolder) {
      return emptyFiles;
    }

    const branchIds = getFolderBranchIds(shareTargetFolder.id, folders);

    return files.filter((file) => file.folderId && branchIds.has(file.folderId));
  }, [files, folders, shareTargetFolder]);

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
      ? createFolderMutation.error instanceof Error
        ? createFolderMutation.error.message
        : updateFolderMutation.error instanceof Error
          ? updateFolderMutation.error.message
          : editingFolder
            ? "Impossible de modifier le dossier."
            : "Impossible de creer le dossier."
      : null;

  const showToast = useCallback((
    intent: ToastState["intent"],
    message: string,
    timeout = 4000,
  ) => {
    setToast({ show: true, intent, message });

    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, timeout);
  }, []);

  useEffect(() => {
    if (currentFolderId && !folderById.has(currentFolderId)) {
      setCurrentFolderId(null);
    }
  }, [currentFolderId, folderById]);

  useEffect(() => {
    if (!openMenuFolderId) {
      return undefined;
    }

    function closeMenu() {
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
  }, [openMenuFolderId]);

  useEffect(() => {
    if (!openSharedFileMenuId) {
      return undefined;
    }

    function closeMenu() {
      setOpenSharedFileMenuId(null);
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
  }, [openSharedFileMenuId]);

  useEffect(() => {
    if (!selectedSharedFileId) {
      return undefined;
    }

    function closePreviewOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedSharedFileId(null);
      }
    }

    window.addEventListener("keydown", closePreviewOnEscape);

    return () => {
      window.removeEventListener("keydown", closePreviewOnEscape);
    };
  }, [selectedSharedFileId]);

  useEffect(() => {
    if (
      selectedSharedFileId &&
      !sharedFiles.some((file) => file.id === selectedSharedFileId)
    ) {
      setSelectedSharedFileId(null);
    }
  }, [selectedSharedFileId, sharedFiles]);

  useEffect(() => {
    if (!isError) {
      return;
    }

    showToast(
      "error",
      error instanceof Error
        ? error.message
        : "Impossible de charger les dossiers.",
      5000,
    );
  }, [error, isError, showToast]);

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

    if (isFilesInitialLoading) {
      showToast("info", "Chargement des fichiers du dossier...", 4000);
      return;
    }

    if (isFilesError) {
      showToast(
        "error",
        filesError instanceof Error
          ? filesError.message
          : "Impossible de charger les fichiers du dossier.",
        5000,
      );
      return;
    }

    if (shareTargetFiles.length === 0) {
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
        shareTargetFiles.map((file) =>
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
        `${shareTargetFiles.length} fichier${shareTargetFiles.length > 1 ? "s" : ""} partage${shareTargetFiles.length > 1 ? "s" : ""} avec ${user.name}.`,
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

  async function handleOpenSharedFilePreview(file: WorkspaceFile) {
    setOpenSharedFileMenuId(null);
    setSelectedSharedFileId(file.id);
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

  async function handleDownloadSharedFile(file: WorkspaceFile) {
    setOpenSharedFileMenuId(null);

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

  async function handleDeleteFolder(folder: Folder) {
    setOpenMenuFolderId(null);

    if (!window.confirm(`Supprimer le dossier "${folder.name}" ?`)) {
      return;
    }

    try {
      await deleteFolderMutation.mutateAsync(folder.id);

      if (currentFolderId === folder.id) {
        setCurrentFolderId(null);
      }

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
          parentId: currentFolder?.id ?? null,
          teamId: null,
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
    closeFolderModal,
    closeFolderShareModal,
    currentFolder,
    deleteFolderMutation,
    downloadSharedFileUrlMutation,
    editingFolder,
    error,
    folderFormError,
    folderModalTitle,
    folderName,
    folderSavingLabel,
    folderSubmitLabel,
    handleDeleteFolder,
    handleDownloadSharedFile,
    handleOpenSharedFilePreview,
    handleSaveFolder,
    handleShareFolder,
    isError,
    isFolderModalOpen,
    isFolderSaving,
    isFoldersInitialLoading,
    isFilesInitialLoading,
    isSharedFilesError,
    isSharedFilesInitialLoading,
    navigate,
    openCreateModal,
    openEditModal,
    openMenuFolderId,
    openSharedFileMenuId,
    pluralizeFolder,
    preview,
    searchTerm,
    selectedSharedFile,
    selectedSharedFileId,
    setCurrentFolderId,
    setFolderName,
    setOpenMenuFolderId,
    setOpenSharedFileMenuId,
    setSearchTerm,
    setSelectedSharedFileId,
    setShareLevel,
    shareFolderWithUser,
    shareLevel,
    shareTargetFiles,
    shareTargetFolder,
    sharedFiles,
    sharedFilesError,
    sharingUserId,
    showToast,
    toast,
    usersQuery,
    visibleFolders,
  };
}
