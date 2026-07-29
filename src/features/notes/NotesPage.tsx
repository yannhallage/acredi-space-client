import { AnimatePresence } from "framer-motion";
import { ClipLoader } from "react-spinners";

import Toast from "../../components/app/Toast/Toast";
import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import { Icon } from "../../shared/ui";

import {
  NoteCard,
  NoteCardSkeleton,
  NoteCreateModal,
  NoteShareModal,
  NotesEmptyState,
  NotesFilteredEmpty,
  NotesPageSkeleton,
  NotesToolbar,
  NoteViewModal,
} from "./components";
import { useNotesPage } from "./hooks/useNotesPage";
import { noteSkeletonKeys } from "./utils";
import "./notes.css";

export function NotesPage() {
  const page = useNotesPage();
  const showWelcomeEmpty =
    !page.isError && !page.isNotesLoading && page.isCollectionEmpty;

  if (page.isNotesInitialLoading) {
    return <NotesPageSkeleton />;
  }

  return (
    <div
      className={
        showWelcomeEmpty
          ? "notes-page notes-board nb-board-empty"
          : "notes-page notes-board"
      }
    >
      {page.toast.show && (
        <Toast intent={page.toast.intent} message={page.toast.message} />
      )}

      <NotesToolbar
        contentFilter={page.contentFilter}
        isFetching={page.isFetching}
        isLoading={page.isLoading}
        onContentFilterChange={page.setContentFilter}
        onRefresh={() => {
          page.refreshNotes().catch(() => undefined);
        }}
        onSortToggle={page.toggleSortMode}
        onTitleFilterChange={page.setTitleFilter}
        titleFilter={page.titleFilter}
      />

      <section
        className={
          page.isNotesLoading
            ? "nb-grid nb-grid-loading"
            : showWelcomeEmpty
              ? "nb-empty-page-section"
              : "nb-grid"
        }
        aria-label="Notes list"
        aria-busy={page.isNotesLoading}
      >
        {page.isNotesLoading ? (
          noteSkeletonKeys.map((item) => <NoteCardSkeleton key={item} />)
        ) : page.isError && page.visibleNotes.length === 0 ? (
          <div className="notes-empty">
            <Icon name="notes" size={14} />
            <strong>Impossible de charger les notes</strong>
            <span>{page.error?.message}</span>
          </div>
        ) : showWelcomeEmpty ? (
          <NotesEmptyState
            isSaving={page.isSavingNote}
            onCreate={page.openCreateModal}
          />
        ) : page.visibleNotes.length === 0 ? (
          <NotesFilteredEmpty />
        ) : (
          page.visibleNotes.map((note) =>
            page.deletingIds.has(note.id) ? (
              <NoteCardSkeleton key={note.id} />
            ) : (
              <NoteCard
                key={note.id}
                isDeleting={page.deletingIds.has(note.id)}
                note={note}
                onEdit={page.openEditModal}
                onShare={page.openShareModal}
                onView={page.openViewModal}
                onDelete={(noteId) => {
                  page.deleteNote(noteId).catch(() => undefined);
                }}
              />
            ),
          )
        )}
      </section>

      {!page.isNotesLoading && !page.isCollectionEmpty ? (
        <PermissionGate permission={PERMISSIONS.CREATE_NOTES}>
          <div className="nb-add-fab">
            <button
              className="nb-add"
              type="button"
              aria-label="Créer une note"
              onClick={page.openCreateModal}
              disabled={page.isSavingNote}
            >
              {page.createNoteMutation.isPending ? (
                <ClipLoader size={16} color="#ffffff" />
              ) : (
                <span className="nb-add-plus" aria-hidden="true" />
              )}
            </button>
          </div>
        </PermissionGate>
      ) : null}

      <NoteShareModal
        error={page.usersQuery.error}
        isOpen={Boolean(page.shareTargetNote)}
        isSharing={page.isSharingNote}
        loading={page.usersQuery.loading}
        note={page.shareTargetNote}
        onClose={page.closeShareModal}
        onRetry={page.usersQuery.refetch}
        onSelect={(user) => {
          page.shareNoteWithUser(user).catch(() => undefined);
        }}
        selectedUserId={page.sharingUserId}
        users={page.usersQuery.data ?? []}
      />

      <AnimatePresence>
        {page.viewingNote ? (
          <NoteViewModal
            key={page.viewingNote.id}
            note={page.viewingNote}
            onClose={page.closeViewModal}
            onEdit={page.openEditModal}
          />
        ) : null}
      </AnimatePresence>

      <NoteCreateModal
        content={page.draftContent}
        color={page.draftColor}
        isEditing={page.isEditing}
        isOpen={page.isNoteModalOpen}
        isSaving={page.isSavingNote}
        onClose={page.closeNoteModal}
        onColorChange={page.setDraftColor}
        onContentChange={page.setDraftContent}
        onSave={() => {
          page.saveNote().catch(() => undefined);
        }}
        onTitleChange={page.setDraftTitle}
        title={page.draftTitle}
      />
    </div>
  );
}
