const messageSkeletons = [
  "chat-message-1",
  "chat-message-2",
  "chat-message-3",
  "chat-message-4",
  "chat-message-5",
];

export function ChatThreadSkeleton() {
  return (
    <section className="thread-panel chat-thread-skeleton" aria-hidden="true">
      <header className="thread-header">
        <span className="skeleton-avatar" />
        <span className="skeleton-copy">
          <span className="skeleton-line chat-skeleton-header-title" />
          <span className="skeleton-line chat-skeleton-header-subtitle" />
        </span>
      </header>

      <div className="message-list">
        {messageSkeletons.map((item, index) => (
          <article
            className={
              index % 2 === 0
                ? "message-bubble chat-message-skeleton"
                : "message-bubble mine chat-message-skeleton"
            }
            key={item}
          >
            {index % 2 === 0 ? <span className="skeleton-avatar" /> : null}
            <div className="skeleton-copy">
              <span className="skeleton-line chat-skeleton-message-meta" />
              <span className="skeleton-line" />
              <span className="skeleton-line chat-skeleton-message-short" />
            </div>
          </article>
        ))}
      </div>

      <div className="composer chat-composer-skeleton">
        <span className="chat-skeleton-composer-input" />
        <span className="skeleton-pill chat-skeleton-composer-button" />
      </div>
    </section>
  );
}

export { messageSkeletons };
