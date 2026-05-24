import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../../shared/ui';

type SortMode = 'newest' | 'oldest';

interface Note {
  id: string;
  title: string;
  content: string;
  authorName: string;
  updatedLabel: string;
  updatedMinutes: number;
}

const initialNotes: Note[] = [
  {
    id: 'note-workspace',
    title: 'Acredi Workspace',
    content:
      "Tailwind CSS works by scanning all of your HTML files, JavaScript components, and any other templates for class names, generating the corresponding styles and then writing them to a static CSS file.\n\nIt's fast, flexible, and reliable - with zero-",
    authorName: 'Administrator',
    updatedLabel: 'just now',
    updatedMinutes: 0
  },
  {
    id: 'note-test',
    title: 'Just an test',
    content: 'Lucide is available as a package for all major package managers.',
    authorName: 'yann hallage',
    updatedLabel: '10 hours ago',
    updatedMinutes: 600
  }
];

const editorTools = ['H1', 'T', 'B', 'I', 'List', '1.', 'Check', 'Left', 'Center', 'Right', 'A', 'Img', 'Link', 'Quote', '<>'];
const noteSkeletons = ['note-skeleton-1', 'note-skeleton-2'];

function NoteCard({ note }: { note: Note }) {
  return (
    <article className="note-card">
      <header>
        <h2>{note.title}</h2>
        <button className="icon-button" type="button" aria-label={`Options ${note.title}`}>
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
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(true);
  const [titleFilter, setTitleFilter] = useState('');
  const [contentFilter, setContentFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  const visibleNotes = useMemo(() => {
    const titleQuery = titleFilter.trim().toLowerCase();
    const contentQuery = contentFilter.trim().toLowerCase();

    return notes
      .filter((note) => {
        const matchesTitle = titleQuery.length === 0 || note.title.toLowerCase().includes(titleQuery);
        const matchesContent = contentQuery.length === 0 || note.content.toLowerCase().includes(contentQuery);
        return matchesTitle && matchesContent;
      })
      .slice()
      .sort((a, b) => (sortMode === 'newest' ? a.updatedMinutes - b.updatedMinutes : b.updatedMinutes - a.updatedMinutes));
  }, [contentFilter, notes, sortMode, titleFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isCreateOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCreateOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isCreateOpen]);

  function resetDraft() {
    setDraftTitle('');
    setDraftContent('');
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

    setNotes((current) => [
      {
        id: `note-${Date.now()}`,
        title,
        content: content || 'No content yet.',
        authorName: 'Administrator',
        updatedLabel: 'just now',
        updatedMinutes: 0
      },
      ...current.map((note) =>
        note.updatedMinutes === 0
          ? { ...note, updatedLabel: 'a few minutes ago', updatedMinutes: 8 }
          : note
      )
    ]);
    closeCreateModal();
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
        <button className="button primary notes-create-button" type="button" onClick={() => setIsCreateOpen(true)}>
          <Icon name="plus" size={12} />
          Create
        </button>
      </section>

      <section className="notes-filters" aria-label="Notes filters">
        <div className="notes-filter-inputs">
          <label>
            <span>Title</span>
            <input value={titleFilter} onChange={(event) => setTitleFilter(event.target.value)} placeholder="Title" />
          </label>
          <label>
            <span>Content</span>
            <input value={contentFilter} onChange={(event) => setContentFilter(event.target.value)} placeholder="Content" />
          </label>
        </div>
        <div className="notes-filter-actions">
          <button className="icon-button bordered" type="button" aria-label="Refresh notes">
            <Icon name="refresh" size={14} />
          </button>
          <button className="button ghost" type="button">
            <Icon name="filter" size={14} />
            Filter
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => setSortMode((current) => (current === 'newest' ? 'oldest' : 'newest'))}
          >
            <Icon name="sort" size={14} />
            Sort
          </button>
          <button className="icon-button bordered" type="button" aria-label="More actions">
            <Icon name="moreH" size={14} />
          </button>
        </div>
      </section>

      <section className="notes-grid" aria-label="Notes list">
        {loading
          ? noteSkeletons.map((item) => <NoteCardSkeleton key={item} />)
          : visibleNotes.map((note) => <NoteCard key={note.id} note={note} />)}
        {!loading && visibleNotes.length === 0 ? (
          <div className="notes-empty">
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
                <button className="icon-button" type="button" aria-label="Open expanded editor">
                  <Icon name="edit" size={16} />
                </button>
                <button className="icon-button" type="button" aria-label="Close create note" onClick={closeCreateModal}>
                  <Icon name="x" size={16} />
                </button>
              </div>
            </header>

            <label className="note-field">
              <span>
                Title <b>*</b>
              </span>
              <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Title" autoFocus />
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
                <textarea value={draftContent} onChange={(event) => setDraftContent(event.target.value)} placeholder="Content" />
              </div>
            </label>

            <footer>
              <button className="button primary notes-submit" type="submit" disabled={!draftTitle.trim()}>
                Create
              </button>
            </footer>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
