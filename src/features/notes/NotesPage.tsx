import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { Icon } from "../../shared/ui";
import { notesService } from "../../shared/api/notes/service";
import Toast from "../../components/app/Toast/Toast";

type SortMode = "newest" | "oldest";

interface Note {
  id: string;
  title: string;
  content: string;
  ownerName: string;
  updatedLabel: string;
  updatedMinutes: number;
  color?: string | null;
}

const initialNotes: Note[] = [];

function computeUpdatedMeta(dateStr?: string | null) {
  if (!dateStr) return { label: "unknown", minutes: 0 };

  const date = new Date(dateStr);
  const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diff < 1) return { label: "just now", minutes: 0 };
  if (diff < 60) return { label: `${diff} minutes ago`, minutes: diff };
  if (diff < 60 * 24)
    return { label: `${Math.floor(diff / 60)} hours ago`, minutes: diff };

  return { label: `${Math.floor(diff / (60 * 24))} days ago`, minutes: diff };
}

function getTextColor(background: string | null | undefined) {
  if (!background) return "inherit";

  const hex = background.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 150 ? "#111" : "#FFF";
}

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
const noteSkeletons = ["note-skeleton-1", "note-skeleton-2"];
const noteColors = [
  "#FFFFFF",
  "#F3F4F6",
  "#DBEAFE",
  "#CFFAFE",
  "#D1FAE5",
  "#FEF3C7",
  "#FEE2E2",
  "#FCE7F3",
  "#DDD6FE",
  "#F3E8FF",
];
  // "#6B21A8",
  // "#6366F1",
  // "#06B6D4",
  // "#10B981",
  // "#F59E0B",
  // "#EF4444",
  // "#EC4899",
// ];

function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  const textColor = getTextColor(note.color);
  const mutedTextColor = textColor === "#111" ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.85)";
  const borderColor = note.color
    ? textColor === "#111"
      ? "rgba(0,0,0,0.14)"
      : "rgba(255,255,255,0.18)"
    : undefined;

  return (
    <article
      className="note-card"
      style={{
        backgroundColor: note.color ?? undefined,
        color: textColor,
        border: borderColor ? `1px solid ${borderColor}` : undefined,
      }}
    >
      <header>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 12,
              height: 12,
              borderRadius: 12,
              display: "inline-block",
              backgroundColor: note.color ?? "transparent",
              border: note.color
                ? "1px solid rgba(0,0,0,0.12)"
                : "1px solid rgba(255,255,255,0.06)",
            }}
          />
          <h2 style={{ color: textColor }}>{note.title}</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label={`Delete ${note.title}`}
          onClick={() => onDelete(note.id)}
          style={{ color: textColor }}
        >
          <Icon name="trash" size={15} className="text-black" />
        </button>
      </header>
      <p style={{ color: mutedTextColor, margin: 0 }}>{note.content}</p>
      <footer style={{ color: mutedTextColor }}>
        <span>
          <i
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 20,
              background: textColor === "#111" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.18)",
              color: textColor,
            }}
          >
            {note.ownerName[0]?.toUpperCase()}
          </i>
          <strong style={{ color: textColor }}>{note.ownerName}</strong>
        </span>
        <time>{note.updatedLabel}</time>
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
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(true);
  const [titleFilter, setTitleFilter] = useState("");
  const [contentFilter, setContentFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{
    show: boolean;
    intent: "success" | "info" | "warning" | "error";
    message: string;
  }>({
    show: false,
    intent: "success",
    message: "",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftColor, setDraftColor] = useState<string | null>(null);

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
          : b.updatedMinutes - a.updatedMinutes,
      );
  }, [contentFilter, notes, sortMode, titleFilter]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await notesService.findMine(false);

        if (!mounted) return;

        const mapped: Note[] = (data || []).map((item) => {
          const meta = computeUpdatedMeta(
            item.updatedAt ?? item.createdAt ?? null,
          );

          return {
            id: item.id,
            title: item.title,
            content: item.content ?? "No content yet.",
            ownerName: item.ownerName ?? item.ownerId ?? "You",
            updatedLabel: meta.label,
            updatedMinutes: meta.minutes,
            color: item.color ?? null,
          };
        });

        setNotes(mapped.length ? mapped : initialNotes);
      } catch (err) {
        setNotes(initialNotes);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isCreateOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreateOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isCreateOpen]);

  function resetDraft() {
    setDraftTitle("");
    setDraftContent("");
    setDraftColor(null);
  }

  function closeCreateModal() {
    setIsCreateOpen(false);
    resetDraft();
  }

  function createNote() {
    const title = draftTitle.trim();
    const content = draftContent.trim();

    if (!title) {
      return;
    }

    (async () => {
      setIsCreating(true);
      const tempId = `note-${Date.now()}`;
      const optimistic: Note = {
        id: tempId,
        title,
        content: content || "No content yet.",
        ownerName: "You",
        updatedLabel: "just now",
        updatedMinutes: 0,
        color: draftColor ?? null,
      };

      setNotes((current) => [optimistic, ...current]);
      resetDraft();
      setIsCreateOpen(false);

      try {
        const created = await notesService.create({
          title,
          content,
          color: draftColor,
        });
        const meta = computeUpdatedMeta(
          created.updatedAt ?? created.createdAt ?? null,
        );

        setNotes((current) => [
          {
            id: created.id,
            title: created.title,
            content: created.content ?? "No content yet.",
            ownerName: created.ownerName ?? created.ownerId ?? "You",
            updatedLabel: meta.label,
            updatedMinutes: meta.minutes,
            color: created.color ?? null,
          },
          ...current.filter((n) => n.id !== tempId),
        ]);

        setToast({
          show: true,
          intent: "success",
          message: "Note créee avec succès!",
        });

        setTimeout(() => {
          setToast((prev) => ({
            ...prev,
            show: false,
          }));
        }, 4000);
      } catch (e) {
        setNotes((current) => current.filter((n) => n.id !== tempId));
        setToast({
          show: true,
          intent: "error",
          message:
            e instanceof Error
              ? e.message
              : "Erreur lors de la création de la note.",
        });

        setTimeout(() => {
          setToast((prev) => ({
            ...prev,
            show: false,
          }));
        }, 5000);
      } finally {
        setIsCreating(false);
      }
    })();
  }

  async function deleteNote(id: string) {
    try {
      setDeletingIds((prev) => new Set([...prev, id]));
      await notesService.delete(id);
      setNotes((current) => current.filter((note) => note.id !== id));
      setToast({
        show: true,
        intent: "success",
        message: "Note supprimée.",
      });
      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          show: false,
        }));
      }, 3000);
    } catch (e) {
      setToast({
        show: true,
        intent: "error",
        message:
          e instanceof Error
            ? e.message
            : "Erreur lors de la suppression.",
      });
      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          show: false,
        }));
      }, 4000);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  async function refreshNotes() {
    try {
      setLoading(true);
      const data = await notesService.findMine(false);

      const mapped: Note[] = (data || []).map((item) => {
        const meta = computeUpdatedMeta(
          item.updatedAt ?? item.createdAt ?? null,
        );

        return {
          id: item.id,
          title: item.title,
          content: item.content ?? "No content yet.",
          ownerName: item.ownerName ?? item.ownerId ?? "You",
          updatedLabel: meta.label,
          updatedMinutes: meta.minutes,
          color: item.color ?? null,
        };
      });

      setNotes(mapped.length ? mapped : initialNotes);
    } catch (err) {
      setToast({
        show: true,
        intent: "error",
        message: "Erreur lors du rafraîchissement.",
      });
      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          show: false,
        }));
      }, 3000);
    } finally {
      setLoading(false);
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
        <button
          className="button primary notes-create-button"
          type="button"
          onClick={() => setIsCreateOpen(true)}
          disabled={isCreating}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          {isCreating ? (
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
            onClick={refreshNotes}
          >
            <Icon name="refresh" size={14} />
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
                current === "newest" ? "oldest" : "newest",
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

      <section className="notes-grid" aria-label="Notes list">
        {loading
          ? noteSkeletons.map((item) => <NoteCardSkeleton key={item} />)
          : [
              ...visibleNotes.map((note) => (
                deletingIds.has(note.id) ? (
                  <NoteCardSkeleton key={note.id} />
                ) : (
                  <NoteCard key={note.id} note={note} onDelete={deleteNote} />
                )
              )),
            ]}
        {!loading && visibleNotes.length === 0 ? (
          <div className="notes-empty ">
            <Icon name="notes" size={14} />
            <strong>No notes found</strong>
            <span>Try another title or content filter.</span>
          </div>
        ) : null}
      </section>

      {/* <div className="notes-pagination" aria-label="Pagination">
        <button className="active" type="button">20</button>
        <button type="button">50</button>
        <button type="button">100</button>
      </div> */}

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
                createNote();
              }}
            >
              <header>
                <h2>Create Note</h2>
                <div>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Open expanded editor"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Close create note"
                    onClick={closeCreateModal}
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
                  />
                </div>
              </label>

              <label className="note-field">
                <span>Color</span>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {noteColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Select color ${c}`}
                      onClick={() => setDraftColor(c === "#FFFFFF" ? null : c)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        border:
                          draftColor === c ||
                          (draftColor === null && c === "#FFFFFF")
                            ? "2px solid #fff"
                            : "1px solid rgba(255,255,255,0.12)",
                        backgroundColor: c,
                        padding: 0,
                        boxSizing: "border-box",
                      }}
                    />
                  ))}
                </div>
              </label>

              <footer>
                <button
                  className="button primary notes-submit"
                  type="submit"
                  disabled={!draftTitle.trim() || isCreating}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {isCreating ? (
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
