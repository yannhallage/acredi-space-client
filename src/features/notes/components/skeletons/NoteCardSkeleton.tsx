export function NoteCardSkeleton() {
  return (
    <article className="nb-grid-item nb-card nb-card-skeleton" aria-hidden="true">
      <span className="skeleton-line nb-skeleton-time" />
      <span className="skeleton-line skeleton-title" />
      <div className="skeleton-copy">
        <span className="skeleton-line" />
        <span className="skeleton-line" />
        <span className="skeleton-line skeleton-short" />
      </div>
      <footer className="nb-footer">
        <span className="skeleton-dot" />
        <span className="skeleton-dot" />
      </footer>
    </article>
  );
}
