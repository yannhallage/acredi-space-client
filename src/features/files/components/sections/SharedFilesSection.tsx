import type { WorkspaceFile } from "../../../../shared/api/files";
import { Icon } from "../../../../shared/ui";

import { pluralizeFile } from "../../utils";
import { FileGrid } from "../widgets/FileGrid";
import { FilesEmptyIllustration } from "../widgets/FilesEmptyIllustration";

const sharedFileSkeletons = [
  "folder-skeleton-1",
  "folder-skeleton-2",
  "folder-skeleton-3",
  "folder-skeleton-4",
  "folder-skeleton-5",
];

export function SharedFilesSection({
  downloadPending,
  error,
  isError,
  isLoading,
  onDownload,
  onOpenPreview,
  onToggleMenu,
  openMenuFileId,
  selectedFileId,
  sharedFiles,
}: {
  downloadPending: boolean;
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
  onDownload: (file: WorkspaceFile) => void;
  onOpenPreview: (file: WorkspaceFile) => void;
  onToggleMenu: (fileId: string) => void;
  openMenuFileId: string | null;
  selectedFileId: string | null;
  sharedFiles: WorkspaceFile[];
}) {
  return (
    <section
      className="files-shared-section"
      aria-labelledby="files-shared-title"
    >
      <div className="">
        <h2 id="files-shared-title">Fichiers partages</h2>
        <span className="">{pluralizeFile(sharedFiles.length)}</span>
      </div>

      {isLoading ? (
        <div
          className="files-file-grid"
          aria-busy="true"
          aria-label="Chargement des fichiers partages"
        >
          {sharedFileSkeletons.map((item) => (
            <article
              className="files-file-card files-file-card-skeleton"
              key={`shared-${item}`}
            >
              <span className="files-file-preview files-file-skeleton-preview" />
              <span className="skeleton-line files-file-skeleton-name" />
              <span className="skeleton-line files-file-skeleton-meta" />
            </article>
          ))}
        </div>
      ) : isError ? (
        <div className="files-inline-state">
          <Icon name="alert" size={28} />
          <div>
            <strong>Fichiers partages indisponibles</strong>
            <p>
              {error instanceof Error
                ? error.message
                : "Impossible de charger les fichiers partages."}
            </p>
          </div>
        </div>
      ) : sharedFiles.length > 0 ? (
        <FileGrid
          downloadPending={downloadPending}
          emptyDescription=""
          emptyTitle=""
          files={sharedFiles}
          metaSpanClassName="text-sm"
          onDownload={onDownload}
          onOpenPreview={onOpenPreview}
          onToggleMenu={onToggleMenu}
          openMenuFileId={openMenuFileId}
          selectedFileId={selectedFileId}
        />
      ) : (
        <div className="files-empty-state files-shared-empty">
          <FilesEmptyIllustration />
          <p>Les fichiers que l'on vous partage apparaitront ici.</p>
        </div>
      )}
    </section>
  );
}
