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

export type FolderColor = {
  body: string;
  tab: string;
  highlight: string;
  shadow: string;
};

const FOLDER_PALETTE: FolderColor[] = [
  {
    body: "#F2C14E",
    tab: "#E8B03A",
    highlight: "#FFE08A",
    shadow: "rgba(201, 148, 32, 0.34)",
  },
  {
    body: "#6EC3E0",
    tab: "#4EADD0",
    highlight: "#B6E5F5",
    shadow: "rgba(56, 148, 184, 0.3)",
  },
  {
    body: "#3F4048",
    tab: "#2E2F36",
    highlight: "#6A6B75",
    shadow: "rgba(20, 20, 24, 0.32)",
  },
  {
    body: "#7B8CFF",
    tab: "#6678F2",
    highlight: "#C2CAFF",
    shadow: "rgba(91, 108, 255, 0.3)",
  },
  {
    body: "#E8926A",
    tab: "#D97850",
    highlight: "#FFC7AB",
    shadow: "rgba(196, 108, 72, 0.3)",
  },
  {
    body: "#5BBF8A",
    tab: "#3EA970",
    highlight: "#B6ECCF",
    shadow: "rgba(48, 150, 100, 0.28)",
  },
];

export type FolderContentsStats = {
  count: number;
  size: number;
};

export function getFolderColor(folder: Folder): FolderColor {
  const key = folder.id || folder.name;
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }

  return FOLDER_PALETTE[hash % FOLDER_PALETTE.length];
}

export function getFolderContentsStats(
  folderId: string,
  files: WorkspaceFile[],
  folders: Folder[],
): FolderContentsStats {
  const branchIds = getFolderBranchIds(folderId, folders);
  let count = 0;
  let size = 0;

  files.forEach((file) => {
    if (file.folderId && branchIds.has(file.folderId)) {
      count += 1;
      size += file.size ?? 0;
    }
  });

  return { count, size };
}

export function buildFolderStatsMap(files: WorkspaceFile[], folders: Folder[]) {
  const stats = new Map<string, FolderContentsStats>();

  folders.forEach((folder) => {
    stats.set(folder.id, getFolderContentsStats(folder.id, files, folders));
  });

  return stats;
}

export function formatFolderMeta(stats: FolderContentsStats) {
  if (stats.count === 0) {
    return "Vide";
  }

  return `${pluralizeFile(stats.count)} • ${formatFileSize(stats.size)}`;
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
