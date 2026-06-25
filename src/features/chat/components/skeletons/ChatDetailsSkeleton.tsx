export function ChatDetailsSkeleton() {
  return (
    <aside className="details-panel chat-details-skeleton" aria-hidden="true">
      <span className="skeleton-line chat-skeleton-details-title" />
      <span className="skeleton-line" />
      <span className="skeleton-line" />
      <span className="skeleton-line skeleton-short" />
    </aside>
  );
}
