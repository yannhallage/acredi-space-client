import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import {
  useDownloadFileUrl,
  useFiles,
  useShareFile,
  useSharedFiles,
  type FilePermissionLevel,
  type WorkspaceFile,
} from "../../shared/api/files";
import {
  useCreateFolder,
  useDeleteFolder,
  useFolders,
  useUpdateFolder,
  type Folder,
} from "../../shared/api/folders";
import { useUsersQuery } from "../../shared/api/users";
import { useAuth } from "../../shared/context";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import type { User } from "../../shared/types";
import Toast from "../../components/app/Toast/Toast";
import { Avatar, EmptyState, FileIcon, Icon } from "../../shared/ui";

const folderSkeletons = [
  "folder-skeleton-1",
  "folder-skeleton-2",
  "folder-skeleton-3",
  "folder-skeleton-4",
  "folder-skeleton-5",
  "folder-skeleton-6",
  "folder-skeleton-7",
  "folder-skeleton-8",
  "folder-skeleton-9",
  "folder-skeleton-10",
];

const emptyFolders: Folder[] = [];
const emptyFiles: WorkspaceFile[] = [];

const folderShareLevels: Array<{
  description: string;
  label: string;
  value: FilePermissionLevel;
}> = [
  {
    description: "Lecture et telechargement",
    label: "Lecture",
    value: "READ",
  },
  {
    description: "Acces avec modification",
    label: "Ecriture",
    value: "WRITE",
  },
];

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

type PreviewState = {
  error: string | null;
  fileId: string | null;
  loading: boolean;
  url: string | null;
};
function pluralizeFolder(count: number) {
  return `${count} dossier${count > 1 ? "s" : ""}`;
}

function pluralizeFile(count: number) {
  return `${count} fichier${count > 1 ? "s" : ""}`;
}

function getFileExtension(file: WorkspaceFile) {
  const nameExtension = file.name.includes(".")
    ? file.name.split(".").pop()
    : null;
  const mimeExtension = file.contentType?.split("/").pop();
  const extension = nameExtension || mimeExtension || "file";

  return extension.slice(0, 4).toUpperCase();
}

function getFileColor(file: WorkspaceFile) {
  const extension = getFileExtension(file).toLowerCase();

  if (extension === "pdf") {
    return "#ff5c75";
  }

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return "#29c36a";
  }

  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) {
    return "#8b7fff";
  }

  if (["zip", "rar", "7z"].includes(extension)) {
    return "#f3a712";
  }

  return "#6f7bff";
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getFolderBranchIds(rootFolderId: string, folders: Folder[]) {
  const branchIds = new Set([rootFolderId]);
  let changed = true;

  while (changed) {
    changed = false;

    folders.forEach((folder) => {
      if (
        folder.parentId &&
        branchIds.has(folder.parentId) &&
        !branchIds.has(folder.id)
      ) {
        branchIds.add(folder.id);
        changed = true;
      }
    });
  }

  return branchIds;
}

function formatFileSize(size: number | null) {
  if (size === null) {
    return "taille inconnue";
  }

  if (size < 1024) {
    return `${size} o`;
  }

  const units = ["Ko", "Mo", "Go", "To"];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatFileDate(date: Date | null) {
  if (!date) {
    return "date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getPreviewKind(file: WorkspaceFile) {
  const contentType = file.contentType?.toLowerCase() ?? "";
  const extension = getFileExtension(file).toLowerCase();

  if (
    contentType.startsWith("image/") ||
    ["gif", "jpeg", "jpg", "png", "webp"].includes(extension)
  ) {
    return "image";
  }

  if (contentType === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  if (contentType.startsWith("video/")) {
    return "video";
  }

  if (contentType.startsWith("audio/")) {
    return "audio";
  }

  if (
    contentType.startsWith("text/") ||
    contentType === "application/json" ||
    ["csv", "json", "md", "txt", "xml"].includes(extension)
  ) {
    return "text";
  }

  return "unsupported";
}

function FilePreviewContent({
  file,
  preview,
}: {
  file: WorkspaceFile;
  preview: PreviewState;
}) {
  const kind = getPreviewKind(file);

  if (preview.loading) {
    return (
      <div className="files-preview-loading" aria-live="polite">
        <span className="skeleton-line files-preview-skeleton-large" />
        <span className="skeleton-line files-preview-skeleton-small" />
      </div>
    );
  }

  if (preview.error) {
    return (
      <div className="files-preview-empty">
        <Icon name="alert" size={34} />
        <strong>Apercu indisponible</strong>
        <p>{preview.error}</p>
      </div>
    );
  }

  if (!preview.url || kind === "unsupported") {
    return (
      <div className="files-preview-empty">
        <FileIcon
          ext={getFileExtension(file)}
          color={getFileColor(file)}
          size={62}
        />
        <strong>Apercu indisponible</strong>
        <p>Ce format ne peut pas encore etre affiche dans la fenetre.</p>
      </div>
    );
  }

  if (kind === "image") {
    return (
      <img
        className="files-preview-media"
        src={preview.url}
        alt={file.name}
      />
    );
  }

  if (kind === "video") {
    return (
      <video className="files-preview-media" src={preview.url} controls />
    );
  }

  if (kind === "audio") {
    return (
      <div className="files-preview-audio">
        <FileIcon
          ext={getFileExtension(file)}
          color={getFileColor(file)}
          size={62}
        />
        <audio src={preview.url} controls />
      </div>
    );
  }

  return (
    <iframe
      className="files-preview-frame"
      src={preview.url}
      title={file.name}
    />
  );
}

function FolderShareModal({
  error,
  fileCount,
  filesLoading,
  folder,
  isOpen,
  isSharing,
  level,
  loading,
  onClose,
  onLevelChange,
  onRetry,
  onSelect,
  selectedUserId,
  users,
}: {
  error: Error | null;
  fileCount: number;
  filesLoading: boolean;
  folder: Folder | null;
  isOpen: boolean;
  isSharing: boolean;
  level: FilePermissionLevel;
  loading: boolean;
  onClose: () => void;
  onLevelChange: (level: FilePermissionLevel) => void;
  onRetry: () => Promise<User[]>;
  onSelect: (user: User) => void;
  selectedUserId: string | null;
  users: User[];
}) {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return users
      .filter((person) => person.id !== currentUser?.id)
      .filter((person) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchable = normalizeSearch(
          [person.name, person.email, person.role, person.team, person.status]
            .filter(Boolean)
            .join(" "),
        );

        return searchable.includes(normalizedQuery);
      });
  }, [currentUser?.id, query, users]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSharing) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSharing, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="dm-new-conversation-overlay folder-share-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={() => {
            if (!isSharing) onClose();
          }}
        >
          <motion.section
            className="dm-new-conversation-modal folder-share-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="folder-share-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="dm-new-conversation-header">
              <div>
                <h2 id="folder-share-title">Partager le dossier</h2>
                <small>
                  {folder ? folder.name : "Selectionnez un utilisateur"}
                </small>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                disabled={isSharing}
              >
                <Icon name="x" size={16} />
              </button>
            </header>

            <label className="dm-new-conversation-search">
              <Icon name="search" size={16} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un utilisateur..."
                disabled={isSharing}
              />
            </label>

            <div className="folder-share-access" aria-label="Niveau d'acces">
              {folderShareLevels.map((option) => (
                <button
                  key={option.value}
                  className={level === option.value ? "active" : ""}
                  type="button"
                  onClick={() => onLevelChange(option.value)}
                  disabled={isSharing}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>

            <div className="dm-new-conversation-list">
              <p>Utilisateurs</p>
              {loading
                ? ["folder-share-loading-1", "folder-share-loading-2"].map(
                    (item) => (
                      <div
                        className="dm-new-conversation-user team-picker-row-skeleton"
                        key={item}
                      >
                        <span className="skeleton-dot" />
                        <span className="skeleton-avatar" />
                        <span>
                          <span className="skeleton-line" />
                          <span className="skeleton-line skeleton-short" />
                        </span>
                        <span className="skeleton-pill" />
                      </div>
                    ),
                  )
                : error ? (
                    <div className="dm-new-conversation-empty">
                      <Icon name="alert" size={18} />
                      <strong>Chargement impossible</strong>
                      <span>{error.message}</span>
                      <button
                        className="button ghost mini"
                        type="button"
                        onClick={() => {
                          onRetry().catch(() => undefined);
                        }}
                        disabled={isSharing}
                      >
                        Reessayer
                      </button>
                    </div>
                  )
                : visibleUsers.map((person) => {
                    const isSelected = selectedUserId === person.id;

                    return (
                      <button
                        key={person.id}
                        className="dm-new-conversation-user folder-share-user"
                        type="button"
                        disabled={isSharing || filesLoading}
                        onClick={() => onSelect(person)}
                      >
                        {isSelected ? (
                          <ClipLoader size={14} color="currentColor" />
                        ) : (
                          <Icon name="send" size={16} />
                        )}
                        <Avatar
                          name={person.name}
                          presence={person.presence}
                          size={34}
                        />
                        <span>
                          <strong>{person.name}</strong>
                          <small>
                            {person.role} - {person.team}
                          </small>
                        </span>
                        <em
                          className={`dm-new-conversation-status presence-${person.presence}`}
                        >
                          {person.status}
                        </em>
                      </button>
                    );
                  })}

              {!loading && !error && visibleUsers.length === 0 ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="users" size={18} />
                  <strong>Aucun utilisateur trouve</strong>
                  <span>Essayez un autre nom, email ou role.</span>
                </div>
              ) : null}
            </div>

            <footer className="dm-new-conversation-footer">
              <span>
                <Icon name="folder" size={14} />
                Dossier partage
              </span>
              <small>
                {filesLoading
                  ? "Chargement des fichiers"
                  : pluralizeFile(fileCount)}
              </small>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function buildFolderTrail(
  folder: Folder | null,
  folderById: Map<string, Folder>,
) {
  const trail: Folder[] = [];
  const visited = new Set<string>();
  let cursor = folder;

  while (cursor && !visited.has(cursor.id)) {
    trail.unshift(cursor);
    visited.add(cursor.id);
    cursor = cursor.parentId ? (folderById.get(cursor.parentId) ?? null) : null;
  }

  return trail;
}

function FilesPageSkeleton() {
  return (
    <div className="files-page folders-only" aria-busy="true">
      <section className="files-explorer">
        <header className="files-manager-header" aria-hidden="true">
          <div className="files-skeleton-heading">
            <span className="skeleton-line files-skeleton-title" />
            <span className="skeleton-line files-skeleton-breadcrumb" />
          </div>
          <span className="skeleton-pill files-skeleton-button" />
        </header>

        <span className="files-skeleton-search" aria-hidden="true" />

        <div className="files-filter-row" aria-hidden="true">
          <span className="files-skeleton-filter" />
          <span className="files-skeleton-filter" />
          <span className="files-skeleton-filter" />
        </div>

        <div className="files-folder-grid" aria-hidden="true">
          {folderSkeletons.map((item) => (
            <article
              className="files-folder-tile files-folder-tile-skeleton"
              key={item}
            >
              <span className="files-folder-art files-folder-skeleton-art" />
              <span className="skeleton-line files-folder-skeleton-name" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}


function formatRelativeDate(date: string) {
  const target = new Date(date);

  if (Number.isNaN(target.getTime())) {
    return "date inconnue";
  }

  const now = new Date();
  const diff = now.getTime() - target.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) {
    return "à l'instant";
  }

  if (minutes < 60) {
    return `il y a ${minutes} min`;
  }

  if (hours < 24) {
    return `il y a ${hours} h`;
  }

  return target.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatPermission(permission: string) {
  const normalized = permission.toUpperCase();

  if (["WRITE", "EDITOR", "EDIT", "ADMIN"].includes(normalized)) {
    return "Modification";
  }

  return "Lecture seule";
}

export function FilesPage() {
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

  const isFolderSaving =
    createFolderMutation.isPending || updateFolderMutation.isPending;
  const isFolderModalOpen = createModalOpen || Boolean(editingFolder);
  const folderModalTitle = editingFolder
    ? "Modifier le dossier"
    : "Creer un dossier";
  const folderSubmitLabel = editingFolder ? "Modifier" : "Creer";
  const folderSavingLabel = editingFolder ? "Modification..." : "Creation...";

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
        `${pluralizeFile(shareTargetFiles.length)} partage${shareTargetFiles.length > 1 ? "s" : ""} avec ${user.name}.`,
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

      setPreview((current) =>
        current.fileId === file.id
          ? {
              error: null,
              fileId: file.id,
              loading: false,
              url,
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

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d'ouvrir ce fichier.",
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

  if (isFoldersInitialLoading) {
    return (
      <>
        {toast.show ? (
          <Toast intent={toast.intent} message={toast.message} />
        ) : null}
        <FilesPageSkeleton />
      </>
    );
  }

  if (isError) {
    return (
      <div className="files-page folders-only">
        {toast.show ? (
          <Toast intent={toast.intent} message={toast.message} />
        ) : null}
        <section className="files-explorer">
          <EmptyState
            title="Dossiers indisponibles"
            body={
              error instanceof Error
                ? error.message
                : "Impossible de charger les dossiers."
            }
          />
        </section>
      </div>
    );
  }

  return (
    <div
      className={
        selectedSharedFile
          ? "files-page folders-only files-folder-detail preview-open"
          : "files-page folders-only"
      }
    >
      {toast.show ? <Toast intent={toast.intent} message={toast.message} /> : null}
      <section className="files-explorer">
        <header className="files-manager-header">
          <div>
            <h1>Fichiers</h1>
            <div className="files-breadcrumb">
              <button type="button" onClick={() => setCurrentFolderId(null)}>
                Acredi Space
              </button>
              {breadcrumbs.map((folder, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <span key={folder.id}>
                    <Icon name="chevRight" size={11} />
                    {isLast ? (
                      <strong>{folder.name}</strong>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentFolderId(folder.id)}
                      >
                        {folder.name}
                      </button>
                    )}
                  </span>
                );
              })}
              <small>{pluralizeFolder(visibleFolders.length)}</small>
            </div>
          </div>
          <PermissionGate
            permissions={[
              PERMISSIONS.CREATE_FOLDER,
              PERMISSIONS.MANAGE_FOLDERS,
            ]}
          >
            <button
              className="button primary notes-create-button"
              type="button"
              onClick={openCreateModal}
            >
              <Icon name="plus" size={13} />
              Nouveau dossier
            </button>
          </PermissionGate>

          {/* Actions fichiers masquees pendant la vue dossiers uniquement.
          <PermissionGate permission={PERMISSIONS.SHARE_FILES}>
            <button className="button ghost" type="button">
              <Icon name="users" size={14} />
              Inviter
            </button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.UPLOAD_OWN_FILES}>
            <button className="button primary" type="button">
              <Icon name="plus" size={14} />
              Importer
            </button>
          </PermissionGate>
          */}
        </header>

        <label className="files-search" htmlFor="files-folder-search">
          <Icon name="search" size={14} />
          <input
            id="files-folder-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un dossier"
          />
        </label>

        {/* <div className="files-filter-row">
          <button type="button">
            Type <Icon name="chevDown" size={11} />
          </button>
          <button type="button">
            Emplacement <Icon name="chevDown" size={11} />
          </button>
          <button type="button">
            Equipe <Icon name="chevDown" size={11} />
          </button>
        </div> */}

        {/* Filtres fichiers masques pendant la vue dossiers uniquement.
        <div className="toolbar-row">
          <div className="segmented">
            {['Tous', 'Documents', 'Images', 'Videos', 'Archives'].map((filter, index) => (
              <button key={filter} className={index === 0 ? 'active' : ''} type="button">
                {filter}
              </button>
            ))}
          </div>
          <div className="toolbar-spacer" />
          <button className="button ghost" type="button">
            Trier - Recents <Icon name="chevDown" size={12} />
          </button>
          <div className="segmented icon-segmented">
            <button className={view === 'grid' ? 'active' : ''} type="button" onClick={() => setView('grid')} aria-label="Vue grille">
              <Icon name="grid" size={15} />
            </button>
            <button className={view === 'list' ? 'active' : ''} type="button" onClick={() => setView('list')} aria-label="Vue liste">
              <Icon name="list" size={15} />
            </button>
          </div>
        </div>
        */}

        {visibleFolders.length > 0 ? (
          <div className="files-folder-grid">
            {visibleFolders.map((folder) => (
              <article
                key={folder.id}
                className={
                  openMenuFolderId === folder.id
                    ? "files-folder-tile menu-open"
                    : "files-folder-tile"
                }
              >
                <button
                  className="files-folder-open"
                  type="button"
                  onClick={() => navigate(`/app/files/${folder.id}`)}
                >
                  <span className="files-folder-art">
                    <span className="files-folder-shape" aria-hidden="true" />
                  </span>
                  <strong>{folder.name}</strong>
                </button>

                <button
                  className="files-folder-menu-button"
                  type="button"
                  aria-label={`Actions ${folder.name}`}
                  aria-haspopup="menu"
                  aria-expanded={openMenuFolderId === folder.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenMenuFolderId((current) =>
                      current === folder.id ? null : folder.id,
                    );
                  }}
                >
                  <Icon name="moreH" size={14} />
                </button>

                {openMenuFolderId === folder.id ? (
                  <div
                    className="files-folder-dropdown"
                    role="menu"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <PermissionGate
                      permissions={[
                        PERMISSIONS.UPDATE_FOLDERS,
                        PERMISSIONS.MANAGE_FOLDERS,
                      ]}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => openEditModal(folder)}
                      >
                        <Icon name="edit" size={13} />
                        Modifier
                      </button>
                    </PermissionGate>

                    <PermissionGate
                      permissions={[
                        PERMISSIONS.SHARE_FILES,
                        PERMISSIONS.MANAGE_FOLDERS,
                      ]}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleShareFolder(folder)}
                      >
                        <Icon name="users" size={13} />
                        Partager
                      </button>
                    </PermissionGate>

                    <PermissionGate
                      permissions={[
                        PERMISSIONS.DELETE_FOLDERS,
                        PERMISSIONS.MANAGE_FOLDERS,
                      ]}
                    >
                      <button
                        className="danger"
                        type="button"
                        role="menuitem"
                        disabled={deleteFolderMutation.isPending}
                        onClick={() => {
                          void handleDeleteFolder(folder);
                        }}
                      >
                        <Icon name="trash" size={13} />
                        Supprimer
                      </button>
                    </PermissionGate>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="files-empty-state">
            <Icon name="folder" size={38} />
            <strong>Aucun dossier</strong>
            <p>Creez un dossier pour organiser cet espace.</p>
          </div>
        )}

        <section
          className="files-shared-section"
          aria-labelledby="files-shared-title"
        >
          <div className="">
            <h2 id="files-shared-title">Fichiers partages</h2>
            <span className="">{pluralizeFile(sharedFiles.length)}</span>
          </div>

          {isSharedFilesInitialLoading ? (
            <div
              className="files-file-grid"
              aria-busy="true"
              aria-label="Chargement des fichiers partages"
            >
              {folderSkeletons.slice(0, 5).map((item) => (
                <article
                  className="files-file-card files-file-card-skeleton"
                  key={`shared-${item}`}
                >
                  <span className="files-file-preview files-file-skeleton-preview" />
                  <span className="skeleton-line files-file-skeleton-name" />
                  <span className="skeleton-line files-file-skeleton-meta" />
                </article>
              ))}
            </div>
          ) : isSharedFilesError ? (
            <div className="files-inline-state">
              <Icon name="alert" size={28} />
              <div>
                <strong>Fichiers partages indisponibles</strong>
                <p>
                  {sharedFilesError instanceof Error
                    ? sharedFilesError.message
                    : "Impossible de charger les fichiers partages."}
                </p>
              </div>
            </div>
          ) : sharedFiles.length > 0 ? (
            <div className="files-file-grid">
              {sharedFiles.map((file) => (
                <article
                  key={file.id}
                  className={
                    [
                      "files-file-card",
                      openSharedFileMenuId === file.id ? "menu-open" : "",
                      selectedSharedFileId === file.id ? "active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <button
                    className="files-file-open"
                    type="button"
                    onClick={() => {
                      void handleOpenSharedFilePreview(file);
                    }}
                  >
                    <span className="files-file-preview">
                      <FileIcon
                        ext={getFileExtension(file)}
                        color={getFileColor(file)}
                        size={46}
                      />
                    </span>
                    <strong>{file.name}</strong>
                    <small>
                      <span  className="text-sm">{formatFileSize(file.size)}</span>
                      <span className="text-sm">{formatFileDate(file.updatedAt)}</span>
                    </small>
                  </button>

                  <button
                    className="files-file-menu-button"
                    type="button"
                    aria-label={`Actions ${file.name}`}
                    aria-haspopup="menu"
                    aria-expanded={openSharedFileMenuId === file.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenSharedFileMenuId((current) =>
                        current === file.id ? null : file.id,
                      );
                    }}
                  >
                    <Icon name="moreH" size={14} />
                  </button>

                  {openSharedFileMenuId === file.id ? (
                    <div
                      className="files-file-dropdown"
                      role="menu"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        disabled={downloadSharedFileUrlMutation.isPending}
                        onClick={() => {
                          void handleDownloadSharedFile(file);
                        }}
                      >
                        <Icon name="download" size={13} />
                        Telecharger
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="files-empty-state files-shared-empty">
              <Icon name="file" size={38} />
              <strong>Aucun fichier partage</strong>
              <p>Les fichiers que l'on vous partage apparaitront ici.</p>
            </div>
          )}
        </section>

        {/* Section fichiers masquee pendant la vue dossiers uniquement.
        <p className="section-label split">
          <span>Fichiers</span>
          <span>{data.files.length} sur 124</span>
        </p>

        {view === 'list' ? (
          <div className="file-table">
            <div className="file-table-head">
              <span />
              <span>Nom</span>
              <span>Taille</span>
              <span>Modifie</span>
              <span>Par</span>
              <span />
            </div>
            {data.files.map((file) => {
              const author = fileAuthor(file);
              return (
                <button
                  key={file.id}
                  className={selected?.id === file.id ? 'file-table-row active' : 'file-table-row'}
                  type="button"
                  onClick={() => setSelectedId(file.id)}
                >
                  <FileIcon ext={file.ext} color={file.color} size={26} />
                  <span>{file.name}</span>
                  <small>{file.size}</small>
                  <small>{file.modifiedLabel}</small>
                  <small className="author-cell"><Avatar name={author.name} size={20} />{author.name}</small>
                  <Icon name="moreH" size={14} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="file-grid">
            {data.files.map((file) => (
              <button
                key={file.id}
                className={selected?.id === file.id ? 'file-card active' : 'file-card'}
                type="button"
                onClick={() => setSelectedId(file.id)}
              >
                <span className="file-card-preview">
                  <FileIcon ext={file.ext} color={file.color} size={48} />
                </span>
                <strong>{file.name}</strong>
                <small><span>{file.size}</span><span>{file.modifiedLabel}</span></small>
              </button>
            ))}
          </div>
        )}
        */}
      </section>

      <AnimatePresence>
        {selectedSharedFile ? (
          <motion.aside
            className="files-preview-drawer"
            key={selectedSharedFile.id}
            initial={{ opacity: 0, x: 360 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 360 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            aria-label={`Apercu ${selectedSharedFile.name}`}
          >
            <header className="files-preview-header">
              <div>
                <span>Fichier partage</span>
                <h2>{selectedSharedFile.name}</h2>
              </div>
              <button
                className="files-preview-close"
                type="button"
                aria-label="Fermer l'apercu"
                onClick={() => setSelectedSharedFileId(null)}
              >
                <Icon name="x" size={15} />
              </button>
            </header>

            <div className="files-preview-surface">
              <FilePreviewContent file={selectedSharedFile} preview={preview} />
            </div>

            <div className="files-preview-actions">
              <button
                className="button primary"
                type="button"
                disabled={downloadSharedFileUrlMutation.isPending}
                onClick={() => {
                  void handleDownloadSharedFile(selectedSharedFile);
                }}
              >
                <Icon name="download" size={13} />
                Telecharger
              </button>
            </div>

            <dl className="files-preview-details">
              <div>
                <dt>Type</dt>
                <dd>{getFileExtension(selectedSharedFile)}</dd>
              </div>
              <div>
                <dt>Taille</dt>
                <dd>{formatFileSize(selectedSharedFile.size)}</dd>
              </div>
              <div>
                <dt>Modifie</dt>
                <dd>{formatFileDate(selectedSharedFile.updatedAt)}</dd>
              </div>
              <div>
                <dt>Chemin</dt>
                <dd>/Acredi Space/Fichiers partages</dd>
              </div>
            </dl>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* Panneau d'apercu fichier masque pendant la vue dossiers uniquement.
      <aside className="file-preview">
        {selected ? (
          <>
            <div className="file-preview-art">
              <FileIcon ext={selected.ext} color={selected.color} size={72} />
              <small>Apercu indisponible</small>
            </div>
            <h2>{selected.name}</h2>
            <p>{selected.ext.toUpperCase()} - {selected.size}</p>
            <div className="button-row">
              <button className="button primary" type="button">Ouvrir</button>
              <button className="icon-button bordered" type="button" aria-label="Telecharger"><Icon name="download" size={14} /></button>
              <PermissionGate permission={PERMISSIONS.SHARE_FILES}>
                <button className="icon-button bordered" type="button" aria-label="Partager"><Icon name="users" size={14} /></button>
              </PermissionGate>
              <button className="icon-button bordered" type="button" aria-label="Plus"><Icon name="moreH" size={14} /></button>
            </div>
            <dl className="details-list">
              <div><dt>Type</dt><dd>{selected.ext.toUpperCase()}</dd></div>
              <div><dt>Modifie</dt><dd>{selected.modifiedLabel}</dd></div>
              <div><dt>Auteur</dt><dd>{fileAuthor(selected).name}</dd></div>
              <div><dt>Chemin</dt><dd>/Acredi Space/Identite</dd></div>
            </dl>
            <div>
              <p className="section-label split"><span>Partage avec</span><span>{selected.sharedWith.length}</span></p>
              <div className="avatar-stack">
                {selected.sharedWith.map((userId) => {
                  const person = users.find((user) => user.id === userId) ?? users[0];
                  return <Avatar key={userId} name={person.name} size={28} ring="var(--bg)" />;
                })}
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="Selection vide" body="Selectionnez un fichier pour voir le detail." />
        )}
      </aside>
      */}

      {isFolderModalOpen ? (
        <div
          className="files-folder-overlay"
          role="presentation"
          onClick={closeFolderModal}
        >
          <form
            className="files-folder-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="folder-create-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSaveFolder}
          >
            <header>
              <div>
                <h2 id="folder-create-title">{folderModalTitle}</h2>
                <p>Dans {currentFolder?.name ?? "Acredi Space"}</p>
              </div>
              <button
                className="files-folder-close"
                type="button"
                aria-label="Fermer"
                onClick={closeFolderModal}
                disabled={isFolderSaving}
              >
                <Icon name="x" size={15} />
              </button>
            </header>

            <label className="files-folder-field" htmlFor="folder-name">
              <span>Nom du dossier</span>
              <input
                id="folder-name"
                autoFocus
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="Ex: Contrats"
                disabled={isFolderSaving}
              />
            </label>

            {createFolderMutation.isError || updateFolderMutation.isError ? (
              <p className="files-folder-error">
                {createFolderMutation.error instanceof Error
                  ? createFolderMutation.error.message
                  : updateFolderMutation.error instanceof Error
                    ? updateFolderMutation.error.message
                    : editingFolder
                      ? "Impossible de modifier le dossier."
                      : "Impossible de creer le dossier."}
              </p>
            ) : null}

            <footer>
              <button
                className="files-modal-secondary"
                type="button"
                onClick={closeFolderModal}
                disabled={isFolderSaving}
              >
                Annuler
              </button>
              <button
                className="files-modal-primary"
                type="submit"
                disabled={!folderName.trim() || isFolderSaving}
              >
                {isFolderSaving ? folderSavingLabel : folderSubmitLabel}
              </button>
            </footer>
          </form>
        </div>
      ) : null}

      <FolderShareModal
        error={usersQuery.error}
        fileCount={shareTargetFiles.length}
        filesLoading={isFilesInitialLoading}
        folder={shareTargetFolder}
        isOpen={Boolean(shareTargetFolder)}
        isSharing={Boolean(sharingUserId)}
        level={shareLevel}
        loading={usersQuery.loading}
        onClose={closeFolderShareModal}
        onLevelChange={setShareLevel}
        onRetry={usersQuery.refetch}
        onSelect={(user) => {
          void shareFolderWithUser(user);
        }}
        selectedUserId={sharingUserId}
        users={usersQuery.data ?? []}
      />
    </div>
  );
}
