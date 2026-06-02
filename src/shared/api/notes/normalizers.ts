
// normalizers.ts
import { Note } from "./type";
import type {NoteResponse} from "../notes/type";
import type {NoteVersion} from "../notes/type";
import type {NoteVersionResponse} from "../notes/type";
export function normalizeNote(note: NoteResponse): Note {
  return {
    id: note.id,
    title: note.title,
    content: note.content ?? "",

    version: note.version,

    visibility: note.visibility,

    pinned: note.pinned,
    archived: note.archived,

    color: note.color ?? null,

    ownerId: note.ownerId,
    ownerName: note.ownerName ?? null,

    teamId: note.teamId ?? null,
    folderId: note.folderId ?? null,
    lastEditedById: note.lastEditedById ?? null,

    tags: note.tags ?? [],

    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
    deletedAt: note.deletedAt ? new Date(note.deletedAt) : null,
  };
}

export function normalizeNotes(notes: NoteResponse[]): Note[] {
  return notes.map(normalizeNote);
}

export function normalizeNoteVersion(
  version: NoteVersionResponse
): NoteVersion {
  return {
    id: version.id,
    noteId: version.noteId,

    versionNumber: version.versionNumber,

    title: version.title,
    content: version.content ?? "",

    editedById: version.editedById ?? null,

    createdAt: new Date(version.createdAt),
  };
}

export function normalizeNoteVersions(
  versions: NoteVersionResponse[]
): NoteVersion[] {
  return versions.map(normalizeNoteVersion);
}
