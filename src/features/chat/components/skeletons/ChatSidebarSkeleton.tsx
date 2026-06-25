const sidebarSkeletons = [
  "chat-sidebar-1",
  "chat-sidebar-2",
  "chat-sidebar-3",
  "chat-sidebar-4",
  "chat-sidebar-5",
];

export function ChatSidebarSkeleton() {
  return (
    <aside className="chat-sidebar chat-sidebar-skeleton" aria-hidden="true">
      <span className="chat-skeleton-search" />
      <span className="skeleton-line chat-skeleton-section-label" />
      {sidebarSkeletons.map((item) => (
        <div className="chat-nav-item-skeleton" key={item}>
          <span className="skeleton-avatar" />
          <span className="skeleton-line chat-skeleton-nav-name" />
        </div>
      ))}
    </aside>
  );
}

export { sidebarSkeletons };
