import type { Folder, FolderResponse } from "./types";

export function normalizeFolder(folder: FolderResponse): Folder {
  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parentId ?? null,
    teamId: folder.teamId ?? null,
    ownerId: folder.ownerId,
    createdAt: new Date(folder.createdAt),
  };
}

export function normalizeFolders(folders: FolderResponse[]): Folder[] {
  return folders.map(normalizeFolder);
}
