import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../../shared/ui";
import { useCreateNote, useNotes, type Note as ApiNote } from "../../shared/api/notes";

type SortMode = "newest" | "oldest";

interface NoteCard {
  id: string;
  title: string;
  content: string;
  authorName: string;
  updatedLabel: string;
  updatedMinutes: number;
  color: string;
}

const initialNotes: NoteCard[] = [
  {
    id: "note-workspace",
    title: "Acredi Workspace",
    content:
      "Tailwind CSS works by scanning all of your HTML files, JavaScript components, and any other templates for class names.",
    authorName: "Administrator",
    updatedLabel: "just now",
    updatedMinutes: 0,
    color: "#171717",
  },
  {
    id: "note-test",
    title: "Just an test",
    content: "Lucide is available as a package for all major package managers.",
    authorName: "yann hallage",
    updatedLabel: "10 hours ago",
    updatedMinutes: 600,
    color: "#2563eb",
  },
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

const noteSkeletons = ["note-skeleton-1", "note-skeleton-2", "note-skeleton-3", "note-skeleton-4"];

function mapApiNoteToCard(note: ApiNote): NoteCard {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    authorName: note.ownerId ?? "Acredi",
    updatedLabel: note.updatedAt
      ? note.updatedAt.toLocaleDateString()
      : "—",
    updatedMinutes: note.updatedAt
      ? Math.max(0, Math.floor((Date.now() - note.updatedAt.getTime()) / 60000))
      : 0,
    color: note.color ?? "#171717",
  };
}

const noteColors = [
  "#171717",
  "#7c3aed",
  "#2563eb",
  "#059669",
  "#ca8a04",
  "#dc2626",
  "#db2777",
];

function NoteCard({ note }: { note: NoteCard }) {
  return (
    <article
      className="note-card"
      style={{
        borderColor: note.color,
        background: `${note.color}15`,
      }}
    >
      <header>
        <h2>{note.title}</h2>

        <button
          className="icon-button"
          type="button"
          aria-label={`Options ${note.title}`}
        >
          <Icon name="moreH" size={15} />
        </button>
      </header>

      <p>{note.content}</p>

      <footer>
        <span>
          <i>{note.authorName[0]?.toUpperCase()}</i>
          <strong>{note.authorName}</strong>
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
  const { data: apiNotes, isLoading, isError, refetch } = useNotes();

  const [notes, setNotes] = useState<NoteCard[]>(() => {
    const stored = localStorage.getItem("acredi-notes");

    if (stored) {
      return JSON.parse(stored);
    }

    return initialNotes;
  });

  const [titleFilter, setTitleFilter] = useState("");
  const [contentFilter, setContentFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const createNoteMutation = useCreateNote();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftColor, setDraftColor] = useState("#171717");

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
    if (apiNotes) {
      setNotes(apiNotes.map(mapApiNoteToCard));
    }
  }, [apiNotes]);

  useEffect(() => {
    if (!isCreateOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreateOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isCreateOpen]);

  function saveNotes(nextNotes: NoteCard[]) {
    setNotes(nextNotes);
    localStorage.setItem("acredi-notes", JSON.stringify(nextNotes));
  }

  function resetDraft() {
    setDraftTitle("");
    setDraftContent("");
    setDraftColor("#171717");
  }

  function closeCreateModal() {
    setIsCreateOpen(false);
    resetDraft();
  }

  function createNote() {
    const title = draftTitle.trim();
    const content = draftContent.trim();

    if (!title) return;

    createNoteMutation.mutate(
      {
        title,
        content: content || "No content yet.",
        color: draftColor,
      },
      {
        onSuccess: (note) => {
          const createdNote = mapApiNoteToCard(note);
          const nextNotes: NoteCard[] = [
            createdNote,
            ...notes.map((oldNote) =>
              oldNote.updatedMinutes === 0
                ? {
                    ...oldNote,
                    updatedLabel: "a few minutes ago",
                    updatedMinutes: 8,
                  }
                : oldNote
            ),
          ];

          saveNotes(nextNotes);
          closeCreateModal();
        },
      }
    );
  }

  return (
    <div className="notes-page">
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
        >
          <Icon name="plus" size={12} />
          Create
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
            onClick={() => void refetch()}
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

      <section className="notes-grid" aria-label="Notes list">
        {isLoading
          ? noteSkeletons.map((item) => <NoteCardSkeleton key={item} />)
          : visibleNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}

        {!isLoading && visibleNotes.length === 0 && (
          <div className="notes-empty">
            <Icon name="notes" size={14} />
            <strong>No notes found</strong>
            <span>Try another title or content filter.</span>
          </div>
        )}
      </section>

      <AnimatePresence>
        {isCreateOpen && (
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

                <div className="note-color-picker">
                  {noteColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`note-color ${
                        draftColor === color ? "active" : ""
                      }`}
                      style={{ background: color }}
                      onClick={() => setDraftColor(color)}
                      aria-label={`Choose color ${color}`}
                    />
                  ))}
                </div>
              </label>

              <footer>
                <button
                  className="button primary notes-submit"
                  type="submit"
                  disabled={!draftTitle.trim()}
                >
                  Create
                </button>
              </footer>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}