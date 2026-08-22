import { useState } from "react";

import type { Folder } from "../../../../shared/api/folders";
import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";

import type { FolderContentsStats } from "../../utils";
import { CreateFolderCard, FolderCard } from "./FolderCard";
import { FilesEmptyIllustration } from "./FilesEmptyIllustration";

function FoldersEmptyState() {
  return (
    <div className="files-empty-state">
      <FilesEmptyIllustration />
      <strong>Aucun dossier</strong>
      <p>Creez un dossier pour organiser cet espace.</p>
    </div>
  );
}

export function FolderGrid({
  deletePending,
  folders,
  getStats,
  hideEmptyState = false,
  onCreate,
  onDelete,
  onEdit,
  onOpen,
  onShare,
  onToggleMenu,
  openMenuFolderId,
}: {
  deletePending: boolean;
  folders: Folder[];
  getStats?: (folder: Folder) => FolderContentsStats | undefined;
  hideEmptyState?: boolean;
  onCreate?: () => void;
  onDelete: (folder: Folder) => void;
  onEdit: (folder: Folder) => void;
  onOpen: (folder: Folder) => void;
  onShare: (folder: Folder) => void;
  onToggleMenu: (folderId: string) => void;
  openMenuFolderId: string | null;
}) {
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  function toggleSelect(folderId: string) {
    setSelectedFolderIds((current) =>
      current.includes(folderId)
        ? current.filter((id) => id !== folderId)
        : [...current, folderId],
    );
  }

  const folderCards = folders.map((folder) => (
    <FolderCard
      key={folder.id}
      deletePending={deletePending}
      folder={folder}
      isMenuOpen={openMenuFolderId === folder.id}
      isSelected={selectedFolderIds.includes(folder.id)}
      onDelete={onDelete}
      onEdit={onEdit}
      onOpen={onOpen}
      onShare={onShare}
      onToggleMenu={onToggleMenu}
      onToggleSelect={toggleSelect}
      stats={getStats?.(folder)}
    />
  ));

  const createCard = onCreate ? (
    <CreateFolderCard onCreate={onCreate} />
  ) : null;

  if (folders.length === 0) {
    if (!onCreate) {
      return hideEmptyState ? null : <FoldersEmptyState />;
    }

    return (
      <PermissionGate
        permissions={[PERMISSIONS.CREATE_FOLDER, PERMISSIONS.MANAGE_FOLDERS]}
        fallback={hideEmptyState ? null : <FoldersEmptyState />}
      >
        <div className="files-folder-grid">{createCard}</div>
      </PermissionGate>
    );
  }

  return (
    <div className="files-folder-grid">
      {folderCards}
      {onCreate ? (
        <PermissionGate
          permissions={[PERMISSIONS.CREATE_FOLDER, PERMISSIONS.MANAGE_FOLDERS]}
        >
          {createCard}
        </PermissionGate>
      ) : null}
    </div>
  );
}
