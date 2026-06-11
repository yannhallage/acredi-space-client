import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import {
  type FilePermissionLevel,
  isSmallFileUpload,
  SMALL_FILE_UPLOAD_MAX_SIZE_LABEL,
  useDeleteFile,
  useDownloadFileUrl,
  useFiles,
  useShareFile,
  useUploadFile,
  type WorkspaceFile,
} from "../../shared/api/files";
import { useFolders, type Folder } from "../../shared/api/folders";
import { useUsersQuery } from "../../shared/api/users";
import { useAuth } from "../../shared/context";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import type { User } from "../../shared/types";
import Toast from "../../components/app/Toast/Toast";
import { Avatar, EmptyState, FileIcon, Icon } from "../../shared/ui";

const fileSkeletons = [
  "file-skeleton-1",
  "file-skeleton-2",
  "file-skeleton-3",
  "file-skeleton-4",
  "file-skeleton-5",
  "file-skeleton-6",
  "file-skeleton-7",
  "file-skeleton-8",
];

const emptyFolders: Folder[] = [];
const emptyFiles: WorkspaceFile[] = [];

const fileShareLevels: Array<{
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

function pluralizeFile(count: number) {
  return `${count} fichier${count > 1 ? "s" : ""}`;
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

  if (["pdf"].includes(extension)) {
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

function FileShareModal({
  error,
  file,
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
  file: WorkspaceFile | null;
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
          className="dm-new-conversation-overlay file-share-overlay"
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
            className="dm-new-conversation-modal file-share-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-share-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="dm-new-conversation-header">
              <div>
                <h2 id="file-share-title">Partager le fichier</h2>
                <small>
                  {file ? file.name : "Selectionnez un utilisateur"}
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
              {fileShareLevels.map((option) => (
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
                ? ["file-share-loading-1", "file-share-loading-2"].map(
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
                        className="dm-new-conversation-user file-share-user"
                        type="button"
                        disabled={isSharing}
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
                <Icon name="file" size={14} />
                Fichier partage
              </span>
              <small>{visibleUsers.length} utilisateur(s)</small>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function FolderFilesPageSkeleton() {
  return (
    <div className="files-page folders-only files-folder-detail" aria-busy="true">
      <section className="files-explorer">
        <header className="files-manager-header" aria-hidden="true">
          <div className="files-skeleton-heading">
            <span className="skeleton-line files-skeleton-title" />
            <span className="skeleton-line files-skeleton-breadcrumb" />
          </div>
          <span className="skeleton-pill files-skeleton-button" />
        </header>

        <span className="files-skeleton-search" aria-hidden="true" />

        <div className="files-file-grid" aria-hidden="true">
          {fileSkeletons.map((item) => (
            <article className="files-file-card files-file-card-skeleton" key={item}>
              <span className="files-file-preview files-file-skeleton-preview" />
              <span className="skeleton-line files-file-skeleton-name" />
              <span className="skeleton-line files-file-skeleton-meta" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FolderFilesPage() {
  const { folderId } = useParams<{ folderId: string }>();
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

  if (!folderId) {
    return <Navigate to="/app/files" replace />;
  }

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

  async function handleDownloadFile(file: WorkspaceFile) {
    setOpenMenuFileId(null);

    try {
      const url = await downloadFileUrlMutation.mutateAsync(file.id);

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

  if (isInitialLoading) {
    return (
      <>
        {toast.show ? (
          <Toast intent={toast.intent} message={toast.message} />
        ) : null}
        <FolderFilesPageSkeleton />
      </>
    );
  }

  if (isFoldersError || isFilesError) {
    const error = foldersError ?? filesError;

    return (
      <div className="files-page folders-only files-folder-detail">
        {toast.show ? (
          <Toast intent={toast.intent} message={toast.message} />
        ) : null}
        <section className="files-explorer">
          <EmptyState
            title="Fichiers indisponibles"
            body={
              error instanceof Error
                ? error.message
                : "Impossible de charger les fichiers."
            }
          />
        </section>
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="files-page folders-only files-folder-detail">
        {toast.show ? (
          <Toast intent={toast.intent} message={toast.message} />
        ) : null}
        <section className="files-explorer">
          <button
            className="files-back-button"
            type="button"
            onClick={() => navigate("/app/files")}
          >
            <Icon name="arrowLeft" size={13} />
            Retour aux dossiers
          </button>
          <EmptyState
            title="Dossier introuvable"
            body="Ce dossier n'existe plus ou vous n'y avez plus acces."
          />
        </section>
      </div>
    );
  }

  return (
    <div
      className={
        selectedFile
          ? "files-page folders-only files-folder-detail preview-open"
          : "files-page folders-only files-folder-detail"
      }
    >
      {toast.show ? <Toast intent={toast.intent} message={toast.message} /> : null}
      <section className="files-explorer">
        <header className="files-manager-header">
          <div>
            <button
              className="files-back-button"
              type="button"
              onClick={() => navigate("/app/files")}
            >
              <Icon name="arrowLeft" size={13} />
              Dossiers
            </button>
            <h1>{currentFolder.name}</h1>
            <div className="files-breadcrumb">
              <button type="button" onClick={() => navigate("/app/files")}>
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
                        onClick={() => navigate(`/app/files/${folder.id}`)}
                      >
                        {folder.name}
                      </button>
                    )}
                  </span>
                );
              })}
              <small>{pluralizeFile(visibleFiles.length)}</small>
            </div>
          </div>

          <PermissionGate permission={PERMISSIONS.UPLOAD_OWN_FILES}>
            <label
              className={
                uploadFileMutation.isPending
                  ? "files-upload-button busy"
                  : "files-upload-button"
              }
            >
              <Icon name="upload" size={13} />
              {uploadFileMutation.isPending ? "Import..." : "Importer"}
              <input
                type="file"
                disabled={uploadFileMutation.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";

                  if (file) {
                    void handleUploadFile(file);
                  }
                }}
              />
            </label>
          </PermissionGate>
        </header>

        <label className="files-search" htmlFor="folder-file-search">
          <Icon name="search" size={14} />
          <input
            id="folder-file-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un fichier"
          />
        </label>

        {visibleFiles.length > 0 ? (
          <div className="files-file-grid">
            {visibleFiles.map((file) => (
              <article
                key={file.id}
                className={
                  [
                    "files-file-card",
                    openMenuFileId === file.id ? "menu-open" : "",
                    selectedFileId === file.id ? "active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <button
                  className="files-file-open"
                  type="button"
                  onClick={() => {
                    void handleOpenPreview(file);
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
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatFileDate(file.updatedAt)}</span>
                  </small>
                </button>

                <button
                  className="files-file-menu-button"
                  type="button"
                  aria-label={`Actions ${file.name}`}
                  aria-haspopup="menu"
                  aria-expanded={openMenuFileId === file.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenMenuFileId((current) =>
                      current === file.id ? null : file.id,
                    );
                  }}
                >
                  <Icon name="moreH" size={14} />
                </button>

                {openMenuFileId === file.id ? (
                  <div
                    className="files-file-dropdown"
                    role="menu"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      disabled={downloadFileUrlMutation.isPending}
                      onClick={() => {
                        void handleDownloadFile(file);
                      }}
                    >
                      <Icon name="download" size={13} />
                      Telecharger
                    </button>

                    <PermissionGate permission={PERMISSIONS.SHARE_FILES}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleShareFile(file)}
                      >
                        <Icon name="users" size={13} />
                        Partager
                      </button>
                    </PermissionGate>

                    <PermissionGate permission={PERMISSIONS.DELETE_FILES}>
                      <button
                        className="danger"
                        type="button"
                        role="menuitem"
                        disabled={deleteFileMutation.isPending}
                        onClick={() => {
                          void handleDeleteFile(file);
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
            <Icon name="file" size={38} />
            <strong>Aucun fichier</strong>
            <p>Importez un fichier dans ce dossier.</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedFile ? (
          <motion.aside
            className="files-preview-drawer"
            key={selectedFile.id}
            initial={{ opacity: 0, x: 360 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 360 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            aria-label={`Apercu ${selectedFile.name}`}
          >
            <header className="files-preview-header">
              <div>
                <span>Apercu fichier</span>
                <h2>{selectedFile.name}</h2>
              </div>
              <button
                className="files-preview-close"
                type="button"
                aria-label="Fermer l'apercu"
                onClick={() => setSelectedFileId(null)}
              >
                <Icon name="x" size={15} />
              </button>
            </header>

            <div className="files-preview-surface">
              <FilePreviewContent file={selectedFile} preview={preview} />
            </div>

            <div className="files-preview-actions">
              <button
                className="button primary"
                type="button"
                disabled={downloadFileUrlMutation.isPending}
                onClick={() => {
                  void handleDownloadFile(selectedFile);
                }}
              >
                <Icon name="download" size={13} />
                Telecharger
              </button>

              <PermissionGate permission={PERMISSIONS.SHARE_FILES}>
                <button
                  className="icon-button bordered"
                  type="button"
                  aria-label="Partager"
                  onClick={() => handleShareFile(selectedFile)}
                >
                  <Icon name="users" size={14} />
                </button>
              </PermissionGate>

              <PermissionGate permission={PERMISSIONS.DELETE_FILES}>
                <button
                  className="icon-button bordered danger"
                  type="button"
                  aria-label="Supprimer"
                  disabled={deleteFileMutation.isPending}
                  onClick={() => {
                    void handleDeleteFile(selectedFile);
                  }}
                >
                  <Icon name="trash" size={14} />
                </button>
              </PermissionGate>
            </div>

            <dl className="files-preview-details">
              <div>
                <dt>Type</dt>
                <dd>{getFileExtension(selectedFile)}</dd>
              </div>
              <div>
                <dt>Taille</dt>
                <dd>{formatFileSize(selectedFile.size)}</dd>
              </div>
              <div>
                <dt>Modifie</dt>
                <dd>{formatFileDate(selectedFile.updatedAt)}</dd>
              </div>
              <div>
                <dt>Chemin</dt>
                <dd>/Acredi Space/{currentPath}</dd>
              </div>
            </dl>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <FileShareModal
        error={usersQuery.error}
        file={shareTargetFile}
        isOpen={Boolean(shareTargetFile)}
        isSharing={Boolean(sharingUserId)}
        level={shareLevel}
        loading={usersQuery.loading}
        onClose={closeFileShareModal}
        onLevelChange={setShareLevel}
        onRetry={usersQuery.refetch}
        onSelect={(user) => {
          void shareFileWithUser(user);
        }}
        selectedUserId={sharingUserId}
        users={usersQuery.data ?? []}
      />
    </div>
  );
}