import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  useFiles,
  useShareFile,
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
import type { User } from "../../../shared/types";

import {
  buildFolderStatsMap,
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
  const usersQuery = useUsersQuery({ enabled: Boolean(shareTargetFolder) });

  const folders = foldersData ?? emptyFolders;
  const files = filesData ?? emptyFiles;
  const isFoldersInitialLoading =
    isPending || isLoading || (isFetching && !foldersData && !isError);
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

  const shareTargetFiles = useMemo(() => {
    if (!shareTargetFolder) {
      return emptyFiles;
    }

    const branchIds = getFolderBranchIds(shareTargetFolder.id, folders);

    return files.filter((file) => file.folderId && branchIds.has(file.folderId));
  }, [files, folders, shareTargetFolder]);

  const folderStatsById = useMemo(
    () => buildFolderStatsMap(files, folders),
    [files, folders],
  );

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
    editingFolder,
    error,
    folderFormError,
    folderModalTitle,
    folderName,
    folderSavingLabel,
    folderStatsById,
    folderSubmitLabel,
    handleDeleteFolder,
    handleSaveFolder,
    handleShareFolder,
    isError,
    isFolderModalOpen,
    isFolderSaving,
    isFoldersInitialLoading,
    isFilesInitialLoading,
    navigate,
    openCreateModal,
    openEditModal,
    openMenuFolderId,
    pluralizeFolder,
    searchTerm,
    setCurrentFolderId,
    setFolderName,
    setOpenMenuFolderId,
    setSearchTerm,
    setShareLevel,
    shareFolderWithUser,
    shareLevel,
    shareTargetFiles,
    shareTargetFolder,
    sharingUserId,
    showToast,
    toast,
    usersQuery,
    visibleFolders,
  };
}
