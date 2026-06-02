import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import Toast from "../../components/app/Toast/Toast";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  type Note as ApiNote,
} from "../../shared/api/notes";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import { Icon } from "../../shared/ui";

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
    content: note.content || "No content yet.",
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
}: {
  isDeleting: boolean;
  note: NoteCard;
  onDelete: (id: string) => void;
}) {
  const textColor = getTextColor(note.color);
  const mutedTextColor = getMutedTextColor(textColor);
  const borderColor = note.color ? getBorderColor(textColor) : undefined;
  const ownerInitial = note.ownerName.trim().charAt(0).toUpperCase() || "A";

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

        <PermissionGate permission={PERMISSIONS.DELETE_NOTES}>
          <button
            className="icon-button"
            type="button"
            aria-label={`Delete ${note.title}`}
            disabled={isDeleting}
            onClick={() => onDelete(note.id)}
            style={{ color: textColor }}
          >
            <Icon name="trash" size={15} />
          </button>
        </PermissionGate>
      </header>

      <p style={{ color: mutedTextColor }}>{note.content}</p>

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

export function NotesPage() {
  const notesQueryParams = useMemo(() => ({ archived: false }), []);
  const {
    data: apiNotes,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useNotes(notesQueryParams);
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();

  const [titleFilter, setTitleFilter] = useState("");
  const [contentFilter, setContentFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftColor, setDraftColor] = useState(noteColors[0]);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });

  const notes = useMemo(
    () => (apiNotes ? apiNotes.map(mapApiNoteToCard) : []),
    [apiNotes]
  );
  const isNotesLoading = isLoading || (isFetching && !apiNotes);

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
    if (!isCreateOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createNoteMutation.isPending) {
        setIsCreateOpen(false);
        resetDraft();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [createNoteMutation.isPending, isCreateOpen]);

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

  function closeCreateModal() {
    if (createNoteMutation.isPending) return;

    setIsCreateOpen(false);
    resetDraft();
  }

  async function createNote() {
    const title = draftTitle.trim();
    const content = draftContent.trim();

    if (!title) return;

    try {
      await createNoteMutation.mutateAsync({
        title,
        content: content || "No content yet.",
        color: draftColor,
      });

      setIsCreateOpen(false);
      resetDraft();
      showToast("success", "Note created successfully.");
    } catch (caughtError) {
      showToast(
        "error",
        caughtError instanceof Error
          ? caughtError.message
          : "Error while creating the note.",
        5000
      );
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
            onClick={() => setIsCreateOpen(true)}
            disabled={createNoteMutation.isPending}
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
              <ClipLoader size={12} color="currentColor" />
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

      <AnimatePresence>
        {isCreateOpen ? (
          <motion.div
            className="note-modal-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onMouseDown={closeCreateModal}
          >
            <motion.form
              className="note-modal"
              aria-label="Create Note"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                createNote().catch(() => undefined);
              }}
            >
              <header>
                <h2>Create Note</h2>

                <div>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Open expanded editor"
                    disabled={createNoteMutation.isPending}
                  >
                    <Icon name="edit" size={16} />
                  </button>

                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Close create note"
                    onClick={closeCreateModal}
                    disabled={createNoteMutation.isPending}
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
                  disabled={createNoteMutation.isPending}
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
                    disabled={createNoteMutation.isPending}
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
                      disabled={createNoteMutation.isPending}
                    />
                  ))}
                </div>
              </label>

              <footer>
                <button
                  className="button primary notes-submit"
                  type="submit"
                  disabled={!draftTitle.trim() || createNoteMutation.isPending}
                >
                  {createNoteMutation.isPending ? (
                    <>
                      <ClipLoader size={12} color="#fff" />
                      Creating...
                    </>
                  ) : (
                    "Create"
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
