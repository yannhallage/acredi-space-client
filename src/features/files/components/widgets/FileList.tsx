import type { WorkspaceFile } from "../../../../shared/api/files";
import { useAuth } from "../../../../shared/context";
import type { User } from "../../../../shared/types";
import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Avatar, FileIcon, Icon } from "../../../../shared/ui";

import { getFileColor, getFileExtension } from "../../filePreview";
import { formatFileDate, formatFileSize, isFileOwnedBy } from "../../utils";
import { FilesEmptyIllustration } from "./FilesEmptyIllustration";
import { SharedByProfileHover } from "./SharedByProfileHover";

export function FileList({
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
  ownerColumnLabel = "Proprietaire",
  restorePending,
  selectedFileId,
  showDelete = false,
  showDownload = true,
  showInlineDownload = false,
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
  ownerColumnLabel?: string;
  restorePending?: boolean;
  selectedFileId: string | null;
  showDelete?: boolean;
  showDownload?: boolean;
  showInlineDownload?: boolean;
  showRestore?: boolean;
  showShare?: boolean;
}) {
  const { user } = useAuth();

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
    <div className="files-file-list" role="table" aria-label="Liste des fichiers">
      <div className="files-file-list-header" role="row">
        <span role="columnheader">Nom</span>
        <span role="columnheader">{ownerColumnLabel}</span>
        <span role="columnheader">
          {showRestore ? "Date de suppression" : "Date de modification"}
        </span>
        <span role="columnheader">Taille</span>
        <span
          role="columnheader"
          className="files-file-list-actions-header"
          aria-label="Actions"
        />
      </div>

      {files.map((file) => {
        const ownerUser = getOwnerUser?.(file) ?? null;
        const ownerLabel = getOwnerLabel?.(file) ?? "—";
        const canDelete = showDelete && onDelete && isFileOwnedBy(file, user?.id);

        return (
          <article
            key={file.id}
            role="row"
            className={
              [
                "files-file-list-row",
                openMenuFileId === file.id ? "menu-open" : "",
                selectedFileId === file.id ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <button
              className="files-file-list-open"
              type="button"
              role="cell"
              onClick={() => {
                void onOpenPreview(file);
              }}
            >
              <span className="files-file-list-icon" aria-hidden="true">
                <FileIcon
                  ext={getFileExtension(file)}
                  color={getFileColor(file)}
                  size={28}
                />
              </span>
              <strong>{file.name}</strong>
            </button>

            <div className="files-file-list-owner" role="cell">
              {ownerUser ? (
                <SharedByProfileHover user={ownerUser} />
              ) : (
                <>
                  <Avatar
                    name={ownerLabel === "—" ? "Utilisateur" : ownerLabel}
                    size={22}
                  />
                  <span>{ownerLabel}</span>
                </>
              )}
            </div>

            <span className="files-file-list-date" role="cell">
              {formatFileDate(file.deletedAt ?? file.updatedAt ?? file.createdAt)}
            </span>

            <span className="files-file-list-size" role="cell">
              {formatFileSize(file.size)}
            </span>

            <div className="files-file-list-actions" role="cell">
              {showInlineDownload && showDownload ? (
                <button
                  className="files-file-inline-action"
                  type="button"
                  aria-label={`Telecharger ${file.name}`}
                  title="Telecharger"
                  disabled={downloadPending}
                  onClick={(event) => {
                    event.stopPropagation();
                    void onDownload(file);
                  }}
                >
                  <Icon name="download" size={14} />
                </button>
              ) : null}

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
                  {showRestore && onRestore ? (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={restorePending}
                      onClick={() => {
                        void onRestore(file);
                      }}
                    >
                      <Icon name="refresh" size={13} />
                      Restaurer
                    </button>
                  ) : null}

                  {showDownload ? (
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
                  ) : null}

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

                  {canDelete ? (
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
                      {showRestore
                        ? "Supprimer definitivement"
                        : "Supprimer"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
