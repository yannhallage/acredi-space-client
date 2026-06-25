import type { Folder } from "../../../../shared/api/folders";
import { Icon } from "../../../../shared/ui";

export function FilesBreadcrumb({
  breadcrumbs,
  countLabel,
  onNavigateFolder,
  onNavigateRoot,
}: {
  breadcrumbs: Folder[];
  countLabel: string;
  onNavigateFolder: (folderId: string) => void;
  onNavigateRoot: () => void;
}) {
  return (
    <div className="files-breadcrumb">
      <button type="button" onClick={onNavigateRoot}>
        Acredi Space
      </button>
      {breadcrumbs.map((folder, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <span key={folder.id}>
            <Icon name="chevRight" size={11} />
            {isLast ? (
              <strong>{folder.name}</strong>
            ) : (
              <button type="button" onClick={() => onNavigateFolder(folder.id)}>
                {folder.name}
              </button>
            )}
          </span>
        );
      })}
      <small>{countLabel}</small>
    </div>
  );
}
