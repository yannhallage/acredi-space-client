const fileSkeletons = [
  "file-skeleton-1",
  "file-skeleton-2",
  "file-skeleton-3",
  "file-skeleton-4",
  "file-skeleton-5",
  "file-skeleton-6",
  "file-skeleton-7",
  "file-skeleton-8",
];

export function FolderFilesPageSkeleton() {
  return (
    <div className="files-page folders-only files-folder-detail" aria-busy="true">
      <section className="files-explorer">
        <header className="files-manager-header" aria-hidden="true">
          <div className="files-skeleton-heading">
            <span className="skeleton-line files-skeleton-title" />
            <span className="skeleton-line files-skeleton-breadcrumb" />
          </div>
          <span className="skeleton-pill files-skeleton-button" />
        </header>

        <span className="files-skeleton-search" aria-hidden="true" />

        <div className="files-file-grid" aria-hidden="true">
          {fileSkeletons.map((item) => (
            <article className="files-file-card files-file-card-skeleton" key={item}>
              <span className="files-file-card-header">
                <span className="skeleton-line files-file-skeleton-icon" />
                <span className="skeleton-line files-file-skeleton-name" />
              </span>
              <span className="files-file-preview files-file-skeleton-preview" />
              <span className="files-file-card-footer">
                <span className="skeleton-line files-file-skeleton-avatar" />
                <span className="skeleton-line files-file-skeleton-meta" />
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
