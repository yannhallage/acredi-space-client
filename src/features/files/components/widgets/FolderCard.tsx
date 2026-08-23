import type { Folder } from "../../../../shared/api/folders";
import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";

import { formatFolderMeta, getFolderColor, type FolderContentsStats } from "../../utils";
import { FilesActionsDropdown } from "./FilesActionsDropdown";

function FolderGlyph({ folder }: { folder: Folder }) {
  const color = getFolderColor(folder);

  return (
    <span
      className="files-folder-glyph"
      aria-hidden="true"
      style={{
        ["--folder-body" as string]: color.body,
        ["--folder-tab" as string]: color.tab,
        ["--folder-highlight" as string]: color.highlight,
        ["--folder-shadow" as string]: color.shadow,
      }}
    >
      <span className="files-folder-glyph-tab" />
      <span className="files-folder-glyph-body" />
    </span>
  );
}

export function FolderCard({
  deletePending,
  folder,
  isMenuOpen,
  isSelected,
  onDelete,
  onEdit,
  onOpen,
  onShare,
  onToggleMenu,
  onToggleSelect,
  stats,
}: {
  deletePending: boolean;
  folder: Folder;
  isMenuOpen: boolean;
  isSelected: boolean;
  onDelete: (folder: Folder) => void;
  onEdit: (folder: Folder) => void;
  onOpen: (folder: Folder) => void;
  onShare: (folder: Folder) => void;
  onToggleMenu: (folderId: string) => void;
  onToggleSelect: (folderId: string) => void;
  stats?: FolderContentsStats;
}) {
  return (
    <article
      className={
        [
          "files-folder-tile",
          isMenuOpen ? "menu-open" : "",
          isSelected ? "is-selected" : "",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <div className="files-folder-art">
        <button
          className={
            isSelected
              ? "files-folder-check is-checked"
              : "files-folder-check"
          }
          type="button"
          aria-label={
            isSelected
              ? `Deselectionner ${folder.name}`
              : `Selectionner ${folder.name}`
          }
          aria-pressed={isSelected}
          onClick={(event) => {
            event.stopPropagation();
            onToggleSelect(folder.id);
          }}
        >
          {isSelected ? <Icon name="check" size={11} /> : null}
        </button>

        <button
          className="files-folder-open"
          type="button"
          onClick={() => onOpen(folder)}
        >
          <FolderGlyph folder={folder} />
        </button>

        <FilesActionsDropdown
          isOpen={isMenuOpen}
          label={`Actions ${folder.name}`}
          onToggle={() => onToggleMenu(folder.id)}
          triggerClassName="files-folder-menu-button"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => onOpen(folder)}
          >
            <Icon name="folder" size={14} />
            Ouvrir
          </button>

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
              <Icon name="edit" size={14} />
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
              <Icon name="users" size={14} />
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
              <Icon name="trash" size={14} />
              Supprimer
            </button>
          </PermissionGate>
        </FilesActionsDropdown>
      </div>

      <button
        className="files-folder-meta"
        type="button"
        onClick={() => onOpen(folder)}
      >
        <strong title={folder.name}>{folder.name}</strong>
        <small>{stats ? formatFolderMeta(stats) : "Vide"}</small>
      </button>
    </article>
  );
}

export function CreateFolderCard({ onCreate }: { onCreate: () => void }) {
  return (
    <article className="files-folder-tile files-folder-create">
      <button
        className="files-folder-create-button"
        type="button"
        onClick={onCreate}
      >
        <span className="files-folder-create-plus" aria-hidden="true">
          <Icon name="plus" size={18} />
        </span>
      </button>
      <span className="files-folder-meta">
        <strong>Nouveau dossier</strong>
      </span>
    </article>
  );
}
