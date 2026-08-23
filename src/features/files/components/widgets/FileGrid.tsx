import type { WorkspaceFile } from "../../../../shared/api/files";
import type { User } from "../../../../shared/types";

import { FileCard } from "./FileCard";
import { FilesEmptyIllustration } from "./FilesEmptyIllustration";

export function FileGrid({
  deletePending,
  downloadPending,
  emptyDescription,
  emptyTitle,
  files,
  getOwnerLabel,
  getOwnerUser,
  onDelete,
  onDownload,
  onOpenPreview,
  onRestore,
  onShare,
  onToggleMenu,
  openMenuFileId,
  restorePending,
  selectedFileId,
  showDelete = false,
  showDownload = true,
  showRestore = false,
  showShare = false,
}: {
  deletePending?: boolean;
  downloadPending: boolean;
  emptyDescription: string;
  emptyTitle: string;
  files: WorkspaceFile[];
  getOwnerLabel?: (file: WorkspaceFile) => string;
  getOwnerUser?: (file: WorkspaceFile) => User | null;
  onDelete?: (file: WorkspaceFile) => void;
  onDownload: (file: WorkspaceFile) => void;
  onOpenPreview: (file: WorkspaceFile) => void;
  onRestore?: (file: WorkspaceFile) => void;
  onShare?: (file: WorkspaceFile) => void;
  onToggleMenu: (fileId: string) => void;
  openMenuFileId: string | null;
  restorePending?: boolean;
  selectedFileId: string | null;
  showDelete?: boolean;
  showDownload?: boolean;
  showRestore?: boolean;
  showShare?: boolean;
}) {
  if (files.length === 0) {
    return (
      <div className="files-empty-state">
        <FilesEmptyIllustration />
        <strong>{emptyTitle}</strong>
        <p>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="files-file-grid">
      {files.map((file) => (
        <FileCard
          key={file.id}
          deletePending={deletePending}
          downloadPending={downloadPending}
          file={file}
          getOwnerLabel={getOwnerLabel}
          getOwnerUser={getOwnerUser}
          isMenuOpen={openMenuFileId === file.id}
          isSelected={selectedFileId === file.id}
          onDelete={onDelete}
          onDownload={onDownload}
          onOpenPreview={onOpenPreview}
          onRestore={onRestore}
          onShare={onShare}
          onToggleMenu={onToggleMenu}
          restorePending={restorePending}
          showDelete={showDelete}
          showDownload={showDownload}
          showRestore={showRestore}
          showShare={showShare}
        />
      ))}
    </div>
  );
}
