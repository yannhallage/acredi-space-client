export interface ApiResponse<TData = unknown> {
  data: TData;
  message?: string;
  status?: string;
  success?: boolean;
  timestamp?: string;
}

export interface CreateNoteRequest {
  title: string;
  content?: string | null;
  visibility?: string;
  teamId?: string | null;
  folderId?: string | null;
  pinned?: boolean;
  color?: string | null;
  tags?: string[];
  [key: string]: unknown;
}

export interface NoteResponse {
  id: string;
  title: string;
  content?: string | null;
  version?: number;
  visibility?: string;
  pinned?: boolean;
  archived?: boolean;
  color?: string | null;
  ownerId?: string | null;
  ownerName?: string | null;    
  teamId?: string | null;
  folderId?: string | null;
  lastEditedById?: string | null;
  tags?: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}
