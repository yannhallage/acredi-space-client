import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import Toast from "../../components/app/Toast/Toast";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useShareNote,
  useUpdateNote,
  type Note as ApiNote,
} from "../../shared/api/notes";
import { useUsersQuery } from "../../shared/api/users";
import { useAuth } from "../../shared/context";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import type { User } from "../../shared/types";
import { Avatar, Icon } from "../../shared/ui";

type SortMode = "newest" | "oldest";

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

interface NoteCard {
  id: string;
  title: string;
  content: string;
  ownerName: string;
  updatedLabel: string;
  updatedMinutes: number;
  color: string | null;
}

const noteSkeletons = [
  "note-skeleton-1",
  "note-skeleton-2",
  "note-skeleton-3",
  "note-skeleton-4",
];

const editorTools = [
  "H1",
  "T",
  "B",
  "I",
  "List",
  "1.",
  "Check",
  "Left",
  "Center",
  "Right",
  "A",
  "Img",
  "Link",
  "Quote",
  "<>",
];

const noteColors = [
  "#171717",
  "#7c3aed",
  "#2563eb",
  "#059669",
  "#ca8a04",
  "#dc2626",
  "#db2777",
];

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function getOwnerDisplayName(note: ApiNote) {
  const ownerName = note.ownerName?.trim();

  if (ownerName) return ownerName;

  const ownerId = note.ownerId?.trim();

  if (!ownerId || isUuidLike(ownerId) || ownerId.length > 28) {
    return "Auteur";
  }

  return ownerId;
}

function computeUpdatedMeta(dateValue?: Date | string | null) {
  if (!dateValue) return { label: "unknown", minutes: 0 };

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const time = date.getTime();

  if (Number.isNaN(time)) {
    return { label: "unknown", minutes: 0 };
  }

  const diff = Math.max(0, Math.floor((Date.now() - time) / 60000));

  if (diff < 1) return { label: "just now", minutes: 0 };
  if (diff < 60) return { label: `${diff} minutes ago`, minutes: diff };
  if (diff < 60 * 24) {
    return { label: `${Math.floor(diff / 60)} hours ago`, minutes: diff };
  }

  return {
    label: `${Math.floor(diff / (60 * 24))} days ago`,
    minutes: diff,
  };
}

function getTextColor(background: string | null | undefined) {
  if (!background || !/^#[0-9a-f]{6}$/i.test(background)) {
    return "var(--text)";
  }

  const hex = background.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 150 ? "#111" : "#fff";
}

function getMutedTextColor(textColor: string) {
  if (textColor === "#111") return "rgba(17, 17, 17, 0.68)";
  if (textColor === "#fff") return "rgba(255, 255, 255, 0.85)";

  return "var(--muted-soft)";
}

function getBorderColor(textColor: string) {
  if (textColor === "#111") return "rgba(0, 0, 0, 0.14)";
  if (textColor === "#fff") return "rgba(255, 255, 255, 0.18)";

  return undefined;
}

function mapApiNoteToCard(note: ApiNote): NoteCard {
  const meta = computeUpdatedMeta(note.updatedAt ?? note.createdAt);

  return {
    id: note.id,
    title: note.title,
    content: note.content,
    ownerName: getOwnerDisplayName(note),
    updatedLabel: meta.label,
    updatedMinutes: meta.minutes,
    color: note.color ?? null,
  };
}

function NoteCard({
  isDeleting,
  note,
  onDelete,
  onEdit,
  onShare,
  onView,
}: {
  isDeleting: boolean;
  note: NoteCard;
  onDelete: (id: string) => void;
  onEdit: (note: NoteCard) => void;
  onShare: (note: NoteCard) => void;
  onView: (note: NoteCard) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const textColor = getTextColor(note.color);
  const mutedTextColor = getMutedTextColor(textColor);
  const borderColor = note.color ? getBorderColor(textColor) : undefined;
  const ownerInitial = note.ownerName.trim().charAt(0).toUpperCase() || "A";
  const menuStyle: CSSProperties = note.color
    ? {
        backgroundColor:
          textColor === "#111"
            ? "rgba(255, 255, 255, 0.96)"
            : "rgba(17, 17, 20, 0.96)",
        borderColor:
          textColor === "#111"
            ? "rgba(0, 0, 0, 0.14)"
            : "rgba(255, 255, 255, 0.18)",
        color: textColor === "#111" ? "#111" : "#fff",
      }
    : {};

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        event.target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <article
      className="note-card"
      style={{
        backgroundColor: note.color ?? undefined,
        borderColor,
        color: textColor,
      }}
    >
      <header>
        <h2 style={{ color: textColor }}>{note.title}</h2>

        <PermissionGate
          permissions={[
            PERMISSIONS.VIEW_NOTES,
            PERMISSIONS.UPDATE_NOTES,
            PERMISSIONS.SHARE_NOTES,
            PERMISSIONS.DELETE_NOTES,
          ]}
        >
          <div className="note-card-actions" ref={menuRef}>
            <button
              className={isMenuOpen ? "icon-button active" : "icon-button"}
              type="button"
              aria-label={`Actions for ${note.title}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              disabled={isDeleting}
              onClick={() => setIsMenuOpen((current) => !current)}
              style={{ color: textColor }}
            >
              {isDeleting ? (
                <ClipLoader size={12} color="currentColor" />
              ) : (
                <Icon name="moreH" size={15} />
              )}
            </button>

            <AnimatePresence>
              {isMenuOpen ? (
                <motion.div
                  className="note-card-menu"
                  role="menu"
                  aria-label={`Actions for ${note.title}`}
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  style={menuStyle}
                >
                  <PermissionGate permission={PERMISSIONS.VIEW_NOTES}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onView(note);
                      }}
                    >
                      <Icon name="eye" size={15} />
                      Voir
                    </button>
                  </PermissionGate>

                  <PermissionGate permission={PERMISSIONS.UPDATE_NOTES}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(note);
                      }}
                    >
                      <Icon name="edit" size={15} />
                      Modifier
                    </button>
                  </PermissionGate>

                  <PermissionGate permission={PERMISSIONS.SHARE_NOTES}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onShare(note);
                      }}
                    >
                      <Icon name="send" size={15} />
                      Partager
                    </button>
                  </PermissionGate>

                  <PermissionGate permission={PERMISSIONS.DELETE_NOTES}>
                    <button
                      className="danger"
                      type="button"
                      role="menuitem"
                      disabled={isDeleting}
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDelete(note.id);
                      }}
                    >
                      <Icon name="trash" size={15} />
                      Supprimer
                    </button>
                  </PermissionGate>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </PermissionGate>
      </header>

      <p style={{ color: mutedTextColor }}>
        {note.content || "No content yet."}
      </p>

      <footer style={{ color: mutedTextColor }}>
        <span>
          <i
            style={{
              background:
                textColor === "#111"
                  ? "rgba(255, 255, 255, 0.24)"
                  : "rgba(0, 0, 0, 0.18)",
              color: textColor,
            }}
          >
            {ownerInitial}
          </i>
          <strong style={{ color: textColor }}>{note.ownerName}</strong>
        </span>

        <time style={{ color: mutedTextColor }}>{note.updatedLabel}</time>
      </footer>
    </article>
  );
}

function NoteCardSkeleton() {
  return (
    <article className="note-card note-card-skeleton" aria-hidden="true">
      <header>
        <span className="skeleton-line skeleton-title" />
        <span className="skeleton-dot" />
      </header>

      <div className="skeleton-copy">
        <span className="skeleton-line" />
        <span className="skeleton-line" />
        <span className="skeleton-line skeleton-short" />
      </div>

      <footer>
        <span>
          <i className="skeleton-avatar" />
          <span className="skeleton-line skeleton-name" />
        </span>

        <span className="skeleton-line skeleton-time" />
      </footer>
    </article>
  );
}

function NotesPageSkeleton() {
  return (
    <div className="notes-page notes-page-skeleton" aria-busy="true">
      <section className="notes-toolbar" aria-hidden="true">
        <div className="notes-page-skeleton-title">
          <span className="skeleton-line notes-page-skeleton-kicker" />
          <span className="skeleton-line notes-page-skeleton-heading" />
        </div>
        <span className="skeleton-pill notes-page-skeleton-create" />
      </section>

      <section className="notes-filters" aria-hidden="true">
        <div className="notes-filter-inputs">
          <span className="notes-skeleton-filter" />
          <span className="notes-skeleton-filter" />
        </div>

        <div className="notes-filter-actions">
          <span className="notes-skeleton-action" />
          <span className="notes-skeleton-action notes-skeleton-action-wide" />
          <span className="notes-skeleton-action notes-skeleton-action-wide" />
          <span className="notes-skeleton-action" />
        </div>
      </section>

      <section className="notes-grid notes-grid-loading" aria-hidden="true">
        {noteSkeletons.map((item) => (
          <NoteCardSkeleton key={item} />
        ))}
      </section>
    </div>
  );
}

function NoteViewModal({
  note,
  onClose,
}: {
  note: NoteCard;
  onClose: () => void;
}) {
  const textColor = getTextColor(note.color);
  const mutedTextColor = getMutedTextColor(textColor);
  const ownerInitial = note.ownerName.trim().charAt(0).toUpperCase() || "A";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="note-modal-overlay note-view-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={onClose}
    >
      <motion.section
        className="note-modal note-view-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-view-title"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div className="note-view-heading">
            <span
              className="note-view-accent"
              style={{ background: note.color ?? "var(--accent)" }}
            />
            <div>
              <small>Note</small>
              <h2 id="note-view-title">{note.title}</h2>
            </div>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fermer la note"
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <article
          className="note-view-content"
          style={{
            backgroundColor: note.color ?? undefined,
            color: textColor,
          }}
        >
          <p style={{ color: mutedTextColor }}>
            {note.content || "No content yet."}
          </p>
        </article>

        <footer>
          <span className="note-view-owner">
            <i>{ownerInitial}</i>
            <strong>{note.ownerName}</strong>
          </span>
          <time>{note.updatedLabel}</time>
        </footer>
      </motion.section>
    </motion.div>
  );
}

function NoteShareModal({
  error,
  isOpen,
  isSharing,
  loading,
  note,
  onClose,
  onRetry,
  onSelect,
  selectedUserId,
  users,
}: {
  error: Error | null;
  isOpen: boolean;
  isSharing: boolean;
  loading: boolean;
  note: NoteCard | null;
  onClose: () => void;
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
        if (!normalizedQuery) return true;

        const searchable = normalizeSearch(
          [person.name, person.email, person.role, person.team, person.status]
            .filter(Boolean)
            .join(" ")
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
          className="dm-new-conversation-overlay note-share-overlay"
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
            className="dm-new-conversation-modal note-share-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-share-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="dm-new-conversation-header">
              <div>
                <h2 id="note-share-title">Partager la note</h2>
                <small>
                  {note ? note.title : "Selectionnez un utilisateur"}
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

            <div className="dm-new-conversation-list">
              <p>Utilisateurs</p>
              {loading
                ? ["note-share-loading-1", "note-share-loading-2"].map(
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
                    )
                  )
                : visibleUsers.map((person) => {
                    const isSelected = selectedUserId === person.id;

                    return (
                      <button
                        key={person.id}
                        className="dm-new-conversation-user note-share-user"
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

              {!loading && error ? (
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
              ) : null}

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
                <Icon name="notes" size={14} />
                Note partagee
              </span>
              <small>{visibleUsers.length} utilisateur(s)</small>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function NotesPage() {
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
  const [shareTargetNote, setShareTargetNote] = useState<NoteCard | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteCard | null>(null);
  const [sharingUserId, setSharingUserId] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteCard | null>(null);
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
    [apiNotes]
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
          : b.updatedMinutes - a.updatedMinutes
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
    timeout = 4000
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

  function openEditModal(note: NoteCard) {
    setEditingNote(note);
    setDraftTitle(note.title);
    setDraftContent(note.content);
    setDraftColor(note.color ?? noteColors[0]);
    setIsNoteModalOpen(true);
  }

  function openShareModal(note: NoteCard) {
    setSharingUserId(null);
    setShareTargetNote(note);
  }

  function openViewModal(note: NoteCard) {
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
        5000
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
        5000
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
        5000
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

  if (isNotesInitialLoading) {
    return <NotesPageSkeleton />;
  }

  return (
    <div className="notes-page">
      {toast.show && <Toast intent={toast.intent} message={toast.message} />}

      <section className="notes-toolbar">
        <div className="notes-titlebar">
          <span>Notes</span>
          <Icon name="list" size={14} />
          <strong>Notes View</strong>
          <Icon name="chevDown" size={14} />
        </div>

        <PermissionGate permission={PERMISSIONS.CREATE_NOTES}>
          <button
            className="button primary notes-create-button"
            type="button"
            onClick={openCreateModal}
            disabled={isSavingNote}
          >
            {createNoteMutation.isPending ? (
              <>
                <ClipLoader size={12} color="#fff" />
                Creating...
              </>
            ) : (
              <>
                <Icon name="plus" size={12} />
                Create
              </>
            )}
          </button>
        </PermissionGate>
      </section>

      <section className="notes-filters" aria-label="Notes filters">
        <div className="notes-filter-inputs">
          <label>
            <span>Title</span>
            <input
              value={titleFilter}
              onChange={(event) => setTitleFilter(event.target.value)}
              placeholder="Title"
            />
          </label>

          <label>
            <span>Content</span>
            <input
              value={contentFilter}
              onChange={(event) => setContentFilter(event.target.value)}
              placeholder="Content"
            />
          </label>
        </div>

        <div className="notes-filter-actions">
          <button
            className="icon-button bordered"
            type="button"
            aria-label="Refresh notes"
            disabled={isFetching}
            onClick={() => {
              refreshNotes().catch(() => undefined);
            }}
          >
            {isFetching && !isLoading ? (
              <span className="skeleton-dot notes-refresh-skeleton" />
            ) : (
              <Icon name="refresh" size={14} />
            )}
          </button>

          <button className="button ghost" type="button">
            <Icon name="filter" size={14} />
            Filter
          </button>

          <button
            className="button ghost"
            type="button"
            onClick={() =>
              setSortMode((current) =>
                current === "newest" ? "oldest" : "newest"
              )
            }
          >
            <Icon name="sort" size={14} />
            Sort
          </button>

          <button
            className="icon-button bordered"
            type="button"
            aria-label="More actions"
          >
            <Icon name="moreH" size={14} />
          </button>
        </div>
      </section>

      <section
        className={
          isNotesLoading ? "notes-grid notes-grid-loading" : "notes-grid"
        }
        aria-label="Notes list"
        aria-busy={isNotesLoading}
      >
        {isNotesLoading
          ? noteSkeletons.map((item) => <NoteCardSkeleton key={item} />)
          : visibleNotes.map((note) =>
              deletingIds.has(note.id) ? (
                <NoteCardSkeleton key={note.id} />
              ) : (
                <NoteCard
                  key={note.id}
                  isDeleting={deletingIds.has(note.id)}
                  note={note}
                  onEdit={openEditModal}
                  onShare={openShareModal}
                  onView={openViewModal}
                  onDelete={(noteId) => {
                    deleteNote(noteId).catch(() => undefined);
                  }}
                />
              )
            )}

        {isError && !isNotesLoading && visibleNotes.length === 0 ? (
          <div className="notes-empty">
            <Icon name="notes" size={14} />
            <strong>Unable to load notes</strong>
            <span>{error.message}</span>
          </div>
        ) : null}

        {!isError && !isNotesLoading && visibleNotes.length === 0 ? (
          <div className="notes-empty">
            <Icon name="notes" size={14} />
            <strong>No notes found</strong>
            <span>Try another title or content filter.</span>
          </div>
        ) : null}
      </section>

      <NoteShareModal
        error={usersQuery.error}
        isOpen={Boolean(shareTargetNote)}
        isSharing={isSharingNote}
        loading={usersQuery.loading}
        note={shareTargetNote}
        onClose={closeShareModal}
        onRetry={usersQuery.refetch}
        onSelect={(user) => {
          shareNoteWithUser(user).catch(() => undefined);
        }}
        selectedUserId={sharingUserId}
        users={usersQuery.data ?? []}
      />

      <AnimatePresence>
        {viewingNote ? (
          <NoteViewModal
            key={viewingNote.id}
            note={viewingNote}
            onClose={closeViewModal}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isNoteModalOpen ? (
          <motion.div
            className="note-modal-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onMouseDown={closeNoteModal}
          >
            <motion.form
              className="note-modal"
              aria-label={isEditing ? "Edit Note" : "Create Note"}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                saveNote().catch(() => undefined);
              }}
            >
              <header>
                <h2>{isEditing ? "Edit Note" : "Create Note"}</h2>

                <div>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Open expanded editor"
                    disabled={isSavingNote}
                  >
                    <Icon name="edit" size={16} />
                  </button>

                  <button
                    className="icon-button"
                    type="button"
                    aria-label={
                      isEditing ? "Close edit note" : "Close create note"
                    }
                    onClick={closeNoteModal}
                    disabled={isSavingNote}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              </header>

              <label className="note-field">
                <span>
                  Title <b>*</b>
                </span>
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  placeholder="Title"
                  autoFocus
                  disabled={isSavingNote}
                />
              </label>

              <label className="note-field">
                <span>Content</span>
                <div className="note-editor">
                  <div className="note-editor-toolbar" aria-hidden="true">
                    {editorTools.map((tool) => (
                      <button key={tool} type="button" tabIndex={-1}>
                        {tool}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={draftContent}
                    onChange={(event) => setDraftContent(event.target.value)}
                    placeholder="Content"
                    disabled={isSavingNote}
                  />
                </div>
              </label>

              <label className="note-field">
                <span>Color</span>
                <div className="note-color-picker">
                  {noteColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`note-color${
                        draftColor === color ? " active" : ""
                      }`}
                      style={{ background: color }}
                      onClick={() => setDraftColor(color)}
                      aria-label={`Choose color ${color}`}
                      disabled={isSavingNote}
                    />
                  ))}
                </div>
              </label>

              <footer>
                <button
                  className="button primary notes-submit"
                  type="submit"
                  disabled={!draftTitle.trim() || isSavingNote}
                >
                  {isSavingNote ? (
                    <>
                      <ClipLoader size={12} color="#fff" />
                      {isEditing ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    isEditing ? "Save" : "Create"
                  )}
                </button>
              </footer>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
