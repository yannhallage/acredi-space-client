import type { ReactNode } from "react";

import type { WorkspaceFile } from "../../../../shared/api/files";
import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";

import { formatFileDate, formatFileSize } from "../../utils";
import { FilesEmptyIllustration } from "./FilesEmptyIllustration";
import { FileThumbnail } from "./FileThumbnail";

export function FileGrid({
  deletePending,
  downloadPending,
  emptyDescription,
  emptyTitle,
  files,
  metaSpanClassName,
  onDelete,
  onDownload,
  onOpenPreview,
  onShare,
  onToggleMenu,
  openMenuFileId,
  selectedFileId,
  showDelete = false,
  showShare = false,
}: {
  deletePending?: boolean;
  downloadPending: boolean;
  emptyDescription: string;
  emptyTitle: string;
  files: WorkspaceFile[];
  metaSpanClassName?: string;
  onDelete?: (file: WorkspaceFile) => void;
  onDownload: (file: WorkspaceFile) => void;
  onOpenPreview: (file: WorkspaceFile) => void;
  onShare?: (file: WorkspaceFile) => void;
  onToggleMenu: (fileId: string) => void;
  openMenuFileId: string | null;
  selectedFileId: string | null;
  showDelete?: boolean;
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
        <article
          key={file.id}
          className={
            [
              "files-file-card",
              openMenuFileId === file.id ? "menu-open" : "",
              selectedFileId === file.id ? "active" : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          <button
            className="files-file-open"
            type="button"
            onClick={() => {
              void onOpenPreview(file);
            }}
          >
            <span className="files-file-preview">
              <FileThumbnail file={file} />
            </span>
            <strong>{file.name}</strong>
            <small>
              <MetaSpan className={metaSpanClassName}>
                {formatFileSize(file.size)}
              </MetaSpan>
              <MetaSpan className={metaSpanClassName}>
                {formatFileDate(file.updatedAt)}
              </MetaSpan>
            </small>
          </button>

          <button
            className="files-file-menu-button"
            type="button"
            aria-label={`Actions ${file.name}`}
            aria-haspopup="menu"
            aria-expanded={openMenuFileId === file.id}
            onClick={(event) => {
              event.stopPropagation();
              onToggleMenu(file.id);
            }}
          >
            <Icon name="moreH" size={14} />
          </button>

          {openMenuFileId === file.id ? (
            <div
              className="files-file-dropdown"
              role="menu"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                disabled={downloadPending}
                onClick={() => {
                  void onDownload(file);
                }}
              >
                <Icon name="download" size={13} />
                Telecharger
              </button>

              {showShare && onShare ? (
                <PermissionGate permission={PERMISSIONS.SHARE_FILES}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => onShare(file)}
                  >
                    <Icon name="users" size={13} />
                    Partager
                  </button>
                </PermissionGate>
              ) : null}

              {showDelete && onDelete ? (
                <PermissionGate permission={PERMISSIONS.DELETE_FILES}>
                  <button
                    className="danger"
                    type="button"
                    role="menuitem"
                    disabled={deletePending}
                    onClick={() => {
                      void onDelete(file);
                    }}
                  >
                    <Icon name="trash" size={13} />
                    Supprimer
                  </button>
                </PermissionGate>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function MetaSpan({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  if (className) {
    return <span className={className}>{children}</span>;
  }

  return <span>{children}</span>;
}
