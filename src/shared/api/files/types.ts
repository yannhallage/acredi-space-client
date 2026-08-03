export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
  success: boolean;
  timestamp?: string;
}

export type FileVisibility = "PRIVATE" | "TEAM" | "PUBLIC" | string;
export type FilePermissionLevel = "READ" | "WRITE" | "ADMIN";

export interface UploadFileRequest {
  file: globalThis.File;
  folderId?: string | null;
  teamId?: string | null;
  visibility?: FileVisibility | null;
}

export interface ShareFileRequest {
  level?: FilePermissionLevel | null;
  userId: string;
}

export interface FileResponse {
  id: string;
  name?: string | null;
  originalName?: string | null;
  fileName?: string | null;
  filename?: string | null;
  folderId?: string | null;
  teamId?: string | null;
  ownerId?: string | null;
  size?: number | string | null;
  fileSize?: number | string | null;
  bytes?: number | string | null;
  contentType?: string | null;
  mimeType?: string | null;
  visibility?: FileVisibility | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  uploadedAt?: string | null;
  [key: string]: unknown;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  folderId: string | null;
  teamId: string | null;
  ownerId: string | null;
  size: number | null;
  contentType: string | null;
  visibility: FileVisibility | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  raw: FileResponse;
}

export interface SharedFile {
  id: string;
  fileId: string;
  fileName: string;
  folderName: string | null;
  sharedByName: string;
  sharedWithName: string;
  permission: string;
  sharedAt: string;
}