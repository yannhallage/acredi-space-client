import type { Folder } from "../../../../shared/api/folders";
import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";

export function FolderGrid({
  deletePending,
  folders,
  onDelete,
  onEdit,
  onOpen,
  onShare,
  onToggleMenu,
  openMenuFolderId,
}: {
  deletePending: boolean;
  folders: Folder[];
  onDelete: (folder: Folder) => void;
  onEdit: (folder: Folder) => void;
  onOpen: (folder: Folder) => void;
  onShare: (folder: Folder) => void;
  onToggleMenu: (folderId: string) => void;
  openMenuFolderId: string | null;
}) {
  if (folders.length === 0) {
    return (
      <div className="files-empty-state">
        <Icon name="folder" size={38} />
        <strong>Aucun dossier</strong>
        <p>Creez un dossier pour organiser cet espace.</p>
      </div>
    );
  }

  return (
    <div className="files-folder-grid">
      {folders.map((folder) => (
        <article
          key={folder.id}
          className={
            openMenuFolderId === folder.id
              ? "files-folder-tile menu-open"
              : "files-folder-tile"
          }
        >
          <button
            className="files-folder-open"
            type="button"
            onClick={() => onOpen(folder)}
          >
            <span className="files-folder-art">
              <span className="files-folder-shape" aria-hidden="true" />
            </span>
            <strong>{folder.name}</strong>
          </button>

          <button
            className="files-folder-menu-button"
            type="button"
            aria-label={`Actions ${folder.name}`}
            aria-haspopup="menu"
            aria-expanded={openMenuFolderId === folder.id}
            onClick={(event) => {
              event.stopPropagation();
              onToggleMenu(folder.id);
            }}
          >
            <Icon name="moreH" size={14} />
          </button>

          {openMenuFolderId === folder.id ? (
            <div
              className="files-folder-dropdown"
              role="menu"
              onClick={(event) => event.stopPropagation()}
            >
              <PermissionGate
                permissions={[
                  PERMISSIONS.UPDATE_FOLDERS,
                  PERMISSIONS.MANAGE_FOLDERS,
                ]}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => onEdit(folder)}
                >
                  <Icon name="edit" size={13} />
                  Modifier
                </button>
              </PermissionGate>

              <PermissionGate
                permissions={[
                  PERMISSIONS.SHARE_FILES,
                  PERMISSIONS.MANAGE_FOLDERS,
                ]}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => onShare(folder)}
                >
                  <Icon name="users" size={13} />
                  Partager
                </button>
              </PermissionGate>

              <PermissionGate
                permissions={[
                  PERMISSIONS.DELETE_FOLDERS,
                  PERMISSIONS.MANAGE_FOLDERS,
                ]}
              >
                <button
                  className="danger"
                  type="button"
                  role="menuitem"
                  disabled={deletePending}
                  onClick={() => {
                    void onDelete(folder);
                  }}
                >
                  <Icon name="trash" size={13} />
                  Supprimer
                </button>
              </PermissionGate>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
