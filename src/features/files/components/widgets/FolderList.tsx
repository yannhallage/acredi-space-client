import type { Folder } from "../../../../shared/api/folders";
import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";

import { FilesEmptyIllustration } from "./FilesEmptyIllustration";

export function FolderList({
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
        <FilesEmptyIllustration />
        <strong>Aucun dossier</strong>
        <p>Creez un dossier pour organiser cet espace.</p>
      </div>
    );
  }

  return (
    <div className="files-file-list" role="table" aria-label="Liste des dossiers">
      <div className="files-file-list-header" role="row">
        <span role="columnheader">Nom</span>
        <span role="columnheader">Proprietaire</span>
        <span role="columnheader">Date de modification</span>
        <span role="columnheader">Taille</span>
        <span role="columnheader" className="files-file-list-actions-header" aria-label="Actions" />
      </div>

      {folders.map((folder) => (
        <article
          key={folder.id}
          role="row"
          className={
            openMenuFolderId === folder.id
              ? "files-file-list-row menu-open"
              : "files-file-list-row"
          }
        >
          <button
            className="files-file-list-open"
            type="button"
            role="cell"
            onClick={() => onOpen(folder)}
          >
            <span className="files-file-list-folder-icon" aria-hidden="true">
              <Icon name="folder" size={18} />
            </span>
            <strong>{folder.name}</strong>
          </button>

          <div className="files-file-list-owner" role="cell">
            <span>moi</span>
          </div>

          <span className="files-file-list-date" role="cell">
            —
          </span>

          <span className="files-file-list-size" role="cell">
            —
          </span>

          <div className="files-file-list-actions" role="cell">
            <button
              className="files-file-menu-button"
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
                className="files-file-dropdown"
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
          </div>
        </article>
      ))}
    </div>
  );
}
