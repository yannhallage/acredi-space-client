export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
  success: boolean;
  timestamp?: string;
}

export interface CreateFolderRequest {
  name: string;
  parentId?: string | null;
  teamId?: string | null;
}

export interface UpdateFolderRequest {
  name: string;
}

export interface FolderResponse {
  id: string;
  name: string;
  parentId: string | null;
  teamId: string | null;
  ownerId: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  teamId: string | null;
  ownerId: string;
  createdAt: Date;
}
