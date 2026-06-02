import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, Icon } from "../../shared/ui";
import { useUsersQuery } from "../../shared/api/users/hooks";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useShareNote,
  useUpdateNote,
  type Note as ApiNote,
} from "../../shared/api/notes";

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

const initialNotes: NoteCard[] = [];

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

const noteSkeletons = [
  "note-skeleton-1",
  "note-skeleton-2",
  "note-skeleton-3",
  "note-skeleton-4",
];

function mapApiNoteToCard(note: ApiNote): NoteCard {
  return {
    id: note.id,
    title: note.title || "Sans titre",
    content: note.content || "Aucun contenu.",
    authorName: note.ownerId ? `Auteur ${note.ownerId.slice(0, 8)}` : "Acredi",
    updatedLabel: note.updatedAt ? note.updatedAt.toLocaleDateString() : "—",
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

function NoteCardItem({
  note,
  onDelete,
  onEdit,
  onShare,
}: {
  note: NoteCard;
  onDelete: (id: string) => void;
  onEdit: (note: NoteCard) => void;
  onShare: (note: NoteCard) => void;
}) {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <article
      className="note-card"
      style={{
        borderColor: note.color,
        background: `${note.color}15`,
      }}
    >
      <header>
        <h2 className="note-title" title={note.title}>
          {note.title}
        </h2>

        <div className="note-menu-wrapper">
          <button
            className="icon-button note-menu-button"
            type="button"
            aria-label={`Options ${note.title}`}
            onClick={() => setOpenMenu((current) => !current)}
          >
           <span className="note-more-dots">⋮</span>
          </button>

          {openMenu && (
            <div className="note-menu">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(false);
                  onEdit(note);
                }}
              >
                <Icon name="edit" size={14} />
                Modifier
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenMenu(false);
                  onShare(note);
                }}
              >
                <Icon name="share" size={14} />
                Partager
              </button>

              <button
                type="button"
                className="danger"
                onClick={() => {
                  setOpenMenu(false);
                  onDelete(note.id);
                }}
              >
                <Icon name="trash" size={14} />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </header>

      <p className="note-content">{note.content}</p>

      <footer>
        <span className="note-author">
          <i>{note.authorName[0]?.toUpperCase()}</i>
          <strong title={note.authorName}>{note.authorName}</strong>
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
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const shareNoteMutation = useShareNote();
  const usersQuery = useUsersQuery();

const [shareTargetNote, setShareTargetNote] = useState<NoteCard | null>(null);
const [selectedShareUsers, setSelectedShareUsers] = useState<string[]>([]);
const [shareLevel, setShareLevel] = useState<"READ" | "WRITE" | "ADMIN">("READ");

const [editingNoteId, setEditingNoteId] = useState<string | null>(null);



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
  setEditingNoteId(null);
  resetDraft();
}

  function createNote() {
  const title = draftTitle.trim();
  const content = draftContent.trim();

  if (!title) return;

  if (editingNoteId) {
    updateNoteMutation.mutate(
      {
        id: editingNoteId,
        request: {
          title,
          content: content || "No content yet.",
          color: draftColor,
        },
      },
      {
        onSuccess: (note) => {
          const updatedNote = mapApiNoteToCard(note);

          setNotes((current) =>
            current.map((item) =>
              item.id === updatedNote.id ? updatedNote : item
            )
          );

          setEditingNoteId(null);
          closeCreateModal();
        },
      }
    );

    return;
  }

  createNoteMutation.mutate(
    {
      title,
      content: content || "No content yet.",
      color: draftColor,
    },
    {
      onSuccess: (note) => {
        const createdNote = mapApiNoteToCard(note);
        setNotes((current) => [createdNote, ...current]);
        closeCreateModal();
      },
    }
  );
}

  function deleteNote(id: string) {
  const confirmed = window.confirm("Supprimer cette note ?");

  if (!confirmed) return;

  deleteNoteMutation.mutate(id, {
    onSuccess: () => {
      setNotes((current) => current.filter((note) => note.id !== id));
    },
  });
}
function editNote(note: NoteCard) {
  setEditingNoteId(note.id);
  setDraftTitle(note.title);
  setDraftContent(note.content);
  setDraftColor(note.color);
  setIsCreateOpen(true);
}

function toggleShareUser(userId: string) {
  setSelectedShareUsers((current) =>
    current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId]
  );
}

function submitShareNote() {
  if (!shareTargetNote || selectedShareUsers.length === 0) return;

  selectedShareUsers.forEach((userId) => {
    shareNoteMutation.mutate({
      id: shareTargetNote.id,
      request: {
        userId,
        level: shareLevel,
      },
    });
  });

  setShareTargetNote(null);
  setSelectedShareUsers([]);
  setShareLevel("READ");
}


function shareNote(note: NoteCard) {
  setShareTargetNote(note);
  setSelectedShareUsers([]);
  setShareLevel("READ");
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

      {isError && (
        <div className="notes-empty">
          <Icon name="notes" size={14} />
          <strong>Erreur lors du chargement</strong>
          <span>Vérifie que le backend est lancé.</span>
        </div>
      )}

      <section className="notes-grid" aria-label="Notes list">
        {isLoading
          ? noteSkeletons.map((item) => <NoteCardSkeleton key={item} />)
          : visibleNotes.map((note) => (
              <NoteCardItem
                key={note.id}
                note={note}
                onDelete={deleteNote}
                onEdit={editNote}
                onShare={shareNote}
              />
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
      {shareTargetNote && (
  <div
    className="note-modal-overlay"
    role="presentation"
    onMouseDown={() => setShareTargetNote(null)}
  >
    <div
      className="note-share-modal"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <header>
        <div>
          <span>Partage</span>
          <h2>Partager la note</h2>
          <p>{shareTargetNote.title}</p>
        </div>

        <button
          className="icon-button"
          type="button"
          onClick={() => setShareTargetNote(null)}
        >
          <Icon name="x" size={16} />
        </button>
      </header>

      <label className="note-field">
        <span>Niveau d’accès</span>

        <select
          value={shareLevel}
          onChange={(event) =>
            setShareLevel(event.target.value as "READ" | "WRITE" | "ADMIN")
          }
        >
          <option value="READ">Lecture</option>
          <option value="WRITE">Modification</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>

      <div className="note-share-users">
        {usersQuery.loading ? (
          <div className="notes-empty">
            <strong>Chargement des utilisateurs...</strong>
          </div>
        ) : usersQuery.data && usersQuery.data.length > 0 ? (
          usersQuery.data.map((user) => {
            const selected = selectedShareUsers.includes(user.id);

            return (
              <button
                key={user.id}
                type="button"
                className={selected ? "note-share-user selected" : "note-share-user"}
                onClick={() => toggleShareUser(user.id)}
              >
                <Avatar name={user.name} size={34} presence={user.presence} />

                <span>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </span>

                <Icon name={selected ? "check" : "plus"} size={15} />
              </button>
            );
          })
        ) : (
          <div className="notes-empty">
            <strong>Aucun utilisateur trouvé</strong>
          </div>
        )}
      </div>

      <footer>
        <button
          className="button ghost"
          type="button"
          onClick={() => setShareTargetNote(null)}
        >
          Annuler
        </button>

        <button
          className="button primary"
          type="button"
          disabled={selectedShareUsers.length === 0 || shareNoteMutation.isPending}
          onClick={submitShareNote}
        >
          Partager avec {selectedShareUsers.length} utilisateur
          {selectedShareUsers.length > 1 ? "s" : ""}
        </button>
      </footer>
    </div>
  </div>
)}






    </div>
  );
}