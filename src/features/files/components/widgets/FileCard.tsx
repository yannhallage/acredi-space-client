import type { WorkspaceFile } from "../../../../shared/api/files";
import { useAuth } from "../../../../shared/context";
import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import type { User } from "../../../../shared/types";
import { Avatar, FileIcon, Icon } from "../../../../shared/ui";

import { getFileColor, getFileExtension } from "../../filePreview";
import { formatFileActivity, isFileOwnedBy } from "../../utils";
import { FileThumbnail } from "./FileThumbnail";

export function FileCard({
  deletePending,
  downloadPending,
  file,
  getOwnerLabel,
  getOwnerUser,
  isMenuOpen,
  isSelected,
  onDelete,
  onDownload,
  onOpenPreview,
  onRestore,
  onShare,
  onToggleMenu,
  restorePending,
  showDelete = false,
  showDownload = true,
  showRestore = false,
  showShare = false,
}: {
  deletePending?: boolean;
  downloadPending: boolean;
  file: WorkspaceFile;
  getOwnerLabel?: (file: WorkspaceFile) => string;
  getOwnerUser?: (file: WorkspaceFile) => User | null;
  isMenuOpen: boolean;
  isSelected: boolean;
  onDelete?: (file: WorkspaceFile) => void;
  onDownload: (file: WorkspaceFile) => void;
  onOpenPreview: (file: WorkspaceFile) => void;
  onRestore?: (file: WorkspaceFile) => void;
  onShare?: (file: WorkspaceFile) => void;
  onToggleMenu: (fileId: string) => void;
  restorePending?: boolean;
  showDelete?: boolean;
  showDownload?: boolean;
  showRestore?: boolean;
  showShare?: boolean;
}) {
  const { user } = useAuth();
  const isOwner = isFileOwnedBy(file, user?.id);
  const canDelete = showDelete && Boolean(onDelete) && isOwner;
  const ownerUser = getOwnerUser?.(file) ?? (isOwner ? user : null);
  const ownerName =
    ownerUser?.name ??
    getOwnerLabel?.(file) ??
    user?.name ??
    "Utilisateur";

  return (
    <article
      className={
        [
          "files-file-card",
          isMenuOpen ? "menu-open" : "",
          isSelected ? "active" : "",
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
        <span className="files-file-card-header">
          <FileIcon
            ext={getFileExtension(file)}
            color={getFileColor(file)}
            size={20}
          />
          <strong title={file.name}>{file.name}</strong>
        </span>

        <span className="files-file-preview">
          <FileThumbnail file={file} />
        </span>

        <span className="files-file-card-footer">
          <Avatar
            name={ownerName === "—" ? "Utilisateur" : ownerName}
            size={22}
            src={ownerUser?.avatarUrl}
          />
          <small>{formatFileActivity(file, { isOwner })}</small>
        </span>
      </button>

      <button
        className="files-file-menu-button"
        type="button"
        aria-label={`Actions ${file.name}`}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={(event) => {
          event.stopPropagation();
          onToggleMenu(file.id);
        }}
      >
        <Icon name="moreV" size={14} />
      </button>

      {isMenuOpen ? (
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
                void onDelete?.(file);
              }}
            >
              <Icon name="trash" size={13} />
              {showRestore ? "Supprimer definitivement" : "Supprimer"}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
