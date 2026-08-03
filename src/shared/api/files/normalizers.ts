import type { FileResponse, WorkspaceFile } from "./types";

function readString(
  source: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function readNestedId(
  source: Record<string, unknown>,
  key: string,
): string | null {
  const value = source[key];

  if (value && typeof value === "object") {
    const id = (value as Record<string, unknown>).id;

    return typeof id === "string" && id.trim() ? id : null;
  }

  return null;
}

function readNumber(
  source: Record<string, unknown>,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readDate(
  source: Record<string, unknown>,
  keys: readonly string[],
): Date | null {
  const value = readString(source, keys);

  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeFile(file: FileResponse): WorkspaceFile {
  const source = file as Record<string, unknown>;
  const name =
    readString(source, ["name", "originalName", "fileName", "filename"]) ??
    "Fichier sans nom";

  return {
    id: file.id,
    name,
    folderId:
      readString(source, ["folderId"]) ?? readNestedId(source, "folder"),
    teamId: readString(source, ["teamId"]) ?? readNestedId(source, "team"),
    ownerId: readString(source, ["ownerId"]) ?? readNestedId(source, "owner"),
    size: readNumber(source, ["size", "sizeBytes", "fileSize", "bytes"]),
    contentType: readString(source, ["contentType", "mimeType"]),
    visibility: file.visibility ?? null,
    createdAt: readDate(source, ["createdAt", "uploadedAt"]),
    updatedAt: readDate(source, ["updatedAt", "createdAt", "uploadedAt"]),
    deletedAt: readDate(source, ["deletedAt"]),
    raw: file,
  };
}

export function normalizeFiles(files: FileResponse[]): WorkspaceFile[] {
  return files.map(normalizeFile);
}
