
// types.ts

export type NoteVisibility =
  | "PRIVATE"
  | "TEAM"
  | "PUBLIC";

export type NotePermissionLevel =
  | "READ"
  | "WRITE"
  | "ADMIN";

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  timestamp?: string;
}

export interface CreateNoteRequest {
  title: string;
  content?: string;
  visibility?: NoteVisibility;
  teamId?: string | null;
  folderId?: string | null;
  pinned?: boolean;
  color?: string;
  tags?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  visibility?: NoteVisibility;
  teamId?: string | null;
  folderId?: string | null;
  pinned?: boolean;
  archived?: boolean;
  color?: string;
  tags?: string[];
}

export interface ShareNoteRequest {
  userId: string;
  level?: NotePermissionLevel;
}

export interface NoteResponse {
  id: string;
  title: string;
  content: string | null;
  version: number;
  visibility: NoteVisibility;
  pinned: boolean;
  archived: boolean;
  color: string | null;

  ownerId: string;
  teamId: string | null;
  folderId: string | null;
  lastEditedById: string | null;

  tags: string[];

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NoteVersionResponse {
  id: string;
  noteId: string;

  versionNumber: number;

  title: string;
  content: string | null;

  editedById: string | null;

  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;

  version: number;

  visibility: NoteVisibility;

  pinned: boolean;
  archived: boolean;

  color: string | null;

  ownerId: string;

  teamId: string | null;
  folderId: string | null;
  lastEditedById: string | null;

  tags: string[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface NoteVersion {
  id: string;
  noteId: string;

  versionNumber: number;

  title: string;
  content: string;

  editedById: string | null;

  createdAt: Date;
}
