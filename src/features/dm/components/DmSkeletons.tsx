const sidebarSkeletonIds = [
  "dm-sidebar-sk-1",
  "dm-sidebar-sk-2",
  "dm-sidebar-sk-3",
  "dm-sidebar-sk-4",
  "dm-sidebar-sk-5",
];

const messageSkeletonIds = [
  "dm-message-sk-1",
  "dm-message-sk-2",
  "dm-message-sk-3",
  "dm-message-sk-4",
];

export function DmSidebarSkeleton() {
  return (
    <aside className="dm-sidebar dm-sidebar-skeleton" aria-hidden="true">
      <div className="dm-sidebar-header">
        <span className="skeleton-line dm-skeleton-kicker" />
        <span className="skeleton-line dm-skeleton-heading" />
      </div>

      <div className="dm-panel">
        <div className="dm-panel-title">
          <span className="skeleton-line dm-skeleton-panel-title" />
          <span className="skeleton-pill dm-skeleton-new-button" />
        </div>

        <span className="dm-skeleton-search" />

        <div className="dm-tabs dm-tabs-skeleton">
          <span className="skeleton-pill dm-skeleton-tab" />
          <span className="skeleton-pill dm-skeleton-tab" />
          <span className="skeleton-pill dm-skeleton-tab" />
        </div>

        <div className="dm-conversation-list">
          {sidebarSkeletonIds.map((item) => (
            <div className="dm-conversation-item-skeleton" key={item}>
              <span className="skeleton-avatar dm-skeleton-list-avatar" />
              <div className="skeleton-copy">
                <span className="skeleton-line dm-skeleton-list-name" />
                <span className="skeleton-line dm-skeleton-list-preview" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function DmThreadSkeleton() {
  return (
    <section className="dm-thread dm-thread-skeleton" aria-hidden="true">
      <header className="dm-thread-header">
        <div className="dm-thread-user">
          <span className="skeleton-avatar dm-skeleton-header-avatar" />
          <div className="skeleton-copy">
            <span className="skeleton-line dm-skeleton-header-title" />
            <span className="skeleton-line dm-skeleton-header-subtitle" />
          </div>
        </div>

        <div className="dm-thread-actions">
          <span className="skeleton-pill dm-skeleton-action" />
          <span className="skeleton-pill dm-skeleton-action" />
          <span className="skeleton-pill dm-skeleton-action" />
        </div>
      </header>

      <main className="dm-thread-body">
        <div className="dm-date-separator dm-date-separator-skeleton">
          <span />
          <span className="skeleton-pill dm-skeleton-date" />
          <span />
        </div>

        {messageSkeletonIds.map((item, index) => (
          <article
            className={`dm-message-row dm-message-skeleton ${
              index % 2 === 1 ? "mine" : ""
            }`}
            key={item}
          >
            <span className="skeleton-avatar dm-skeleton-message-avatar" />
            <div className="skeleton-copy">
              <span className="skeleton-line dm-skeleton-message-meta" />
              <span className="skeleton-line dm-skeleton-message-body" />
              <span className="skeleton-line dm-skeleton-message-seen" />
            </div>
          </article>
        ))}
      </main>

      <div className="dm-composer dm-composer-skeleton">
        <span className="dm-skeleton-composer-input" />
        <div className="dm-composer-footer">
          <div className="dm-composer-tools">
            <span className="skeleton-pill dm-skeleton-tool" />
            <span className="skeleton-pill dm-skeleton-tool" />
            <span className="skeleton-pill dm-skeleton-tool" />
          </div>
          <div className="dm-send-area">
            <span className="skeleton-line dm-skeleton-send-hint" />
            <span className="skeleton-pill dm-skeleton-send-button" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function DmPageSkeleton() {
  return (
    <div className="dm-page dm-page-skeleton" aria-busy="true">
      <DmSidebarSkeleton />
      <DmThreadSkeleton />
    </div>
  );
}
