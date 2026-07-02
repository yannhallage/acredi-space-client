import { noteSkeletonKeys } from "../../utils";
import { NoteCardSkeleton } from "./NoteCardSkeleton";

export function NotesPageSkeleton() {
  return (
    <div className="notes-page notes-board notes-board-skeleton" aria-busy="true">
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

      <section className="nb-grid nb-grid-loading" aria-hidden="true">
        {noteSkeletonKeys.map((item) => (
          <NoteCardSkeleton key={item} />
        ))}
      </section>
    </div>
  );
}
