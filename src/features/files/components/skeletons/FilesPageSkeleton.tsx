const folderSkeletons = [
  "folder-skeleton-1",
  "folder-skeleton-2",
  "folder-skeleton-3",
  "folder-skeleton-4",
  "folder-skeleton-5",
  "folder-skeleton-6",
  "folder-skeleton-7",
  "folder-skeleton-8",
  "folder-skeleton-9",
  "folder-skeleton-10",
];

export function FilesPageSkeleton() {
  return (
    <div className="files-page folders-only" aria-busy="true">
      <section className="files-explorer">
        <header className="files-manager-header" aria-hidden="true">
          <div className="files-skeleton-heading">
            <span className="skeleton-line files-skeleton-title" />
            <span className="skeleton-line files-skeleton-breadcrumb" />
          </div>
          <span className="skeleton-pill files-skeleton-button" />
        </header>

        <span className="files-skeleton-search" aria-hidden="true" />

        <div className="files-filter-row" aria-hidden="true">
          <span className="files-skeleton-filter" />
          <span className="files-skeleton-filter" />
          <span className="files-skeleton-filter" />
        </div>

        <div className="files-folder-grid" aria-hidden="true">
          {folderSkeletons.map((item) => (
            <article
              className="files-folder-tile files-folder-tile-skeleton"
              key={item}
            >
              <span className="files-folder-art files-folder-skeleton-art" />
              <span className="files-folder-meta">
                <span className="skeleton-line files-folder-skeleton-name" />
                <span className="skeleton-line files-folder-skeleton-meta" />
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
