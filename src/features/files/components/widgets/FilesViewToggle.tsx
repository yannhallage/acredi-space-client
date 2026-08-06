import { Icon } from "../../../../shared/ui";

import type { FilesViewMode } from "../../hooks/useFilesViewMode";

export function FilesViewToggle({
  onChange,
  viewMode,
}: {
  onChange: (mode: FilesViewMode) => void;
  viewMode: FilesViewMode;
}) {
  return (
    <div className="files-view-toggle" role="group" aria-label="Mode d'affichage">
      <button
        className={viewMode === "list" ? "active" : undefined}
        type="button"
        aria-label="Vue liste"
        aria-pressed={viewMode === "list"}
        onClick={() => onChange("list")}
      >
        <Icon name="list" size={15} />
      </button>
      <button
        className={viewMode === "grid" ? "active" : undefined}
        type="button"
        aria-label="Vue grille"
        aria-pressed={viewMode === "grid"}
        onClick={() => onChange("grid")}
      >
        <Icon name="grid" size={15} />
      </button>
    </div>
  );
}
