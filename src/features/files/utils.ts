import type { WorkspaceFile } from "../../shared/api/files";
import type { Folder } from "../../shared/api/folders";

export function isFileOwnedBy(
  file: WorkspaceFile,
  userId: string | null | undefined,
) {
  return Boolean(userId && file.ownerId && file.ownerId === userId);
}

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function formatFileSize(size: number | null) {
  if (size === null) {
    return "taille inconnue";
  }

  if (size < 1024) {
    return `${size} o`;
  }

  const units = ["Ko", "Mo", "Go", "To"];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatFileDate(date: Date | null) {
  if (!date) {
    return "date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatFileDateShort(date: Date | null) {
  if (!date) {
    return "date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatFileActivity(
  file: WorkspaceFile,
  options?: { isOwner?: boolean },
) {
  const date = formatFileDateShort(
    file.deletedAt ?? file.updatedAt ?? file.createdAt,
  );

  if (file.deletedAt) {
    return `Supprime • ${date}`;
  }

  const wasUpdated =
    Boolean(file.updatedAt && file.createdAt) &&
    file.updatedAt!.getTime() !== file.createdAt!.getTime();

  if (options?.isOwner) {
    return wasUpdated
      ? `Vous avez modifie • ${date}`
      : `Vous avez importe • ${date}`;
  }

  return wasUpdated ? `Modifie • ${date}` : `Importe • ${date}`;
}

export function buildFolderTrail(
  folder: Folder | null,
  folderById: Map<string, Folder>,
) {
  const trail: Folder[] = [];
  const visited = new Set<string>();
  let cursor = folder;

  while (cursor && !visited.has(cursor.id)) {
    trail.unshift(cursor);
    visited.add(cursor.id);
    cursor = cursor.parentId ? (folderById.get(cursor.parentId) ?? null) : null;
  }

  return trail;
}

export function getFolderBranchIds(rootFolderId: string, folders: Folder[]) {
  const branchIds = new Set([rootFolderId]);
  let changed = true;

  while (changed) {
    changed = false;

    folders.forEach((folder) => {
      if (
        folder.parentId &&
        branchIds.has(folder.parentId) &&
        !branchIds.has(folder.id)
      ) {
        branchIds.add(folder.id);
        changed = true;
      }
    });
  }

  return branchIds;
}

export function pluralizeFolder(count: number) {
  return `${count} dossier${count > 1 ? "s" : ""}`;
}

export function pluralizeFile(count: number) {
  return `${count} fichier${count > 1 ? "s" : ""}`;
}
