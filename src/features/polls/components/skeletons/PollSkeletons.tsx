export function PollCardSkeleton() {
  return (
    <div className="pb-card pb-card-skeleton" aria-hidden="true">
      <div className="pb-skel-line pb-skel-badge" />
      <div className="pb-skel-line pb-skel-title" />
      <div className="pb-skel-line pb-skel-meta" />
      <div className="pb-skel-line pb-skel-actions" />
    </div>
  );
}

export function PollsPageSkeleton() {
  return (
    <div className="polls-page polls-board polls-board-skeleton">
      <div className="pb-toolbar">
        <div className="pb-skel-line pb-skel-toolbar" />
      </div>
      <section className="pb-grid pb-grid-loading">
        {Array.from({ length: 6 }).map((_, index) => (
          <PollCardSkeleton key={`poll-page-skel-${index}`} />
        ))}
      </section>
    </div>
  );
}
