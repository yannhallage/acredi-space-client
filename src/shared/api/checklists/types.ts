export type ChecklistRole = "OWNER" | "EDITOR";

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  timestamp?: string;
}

export interface ChecklistMember {
  userId: string;
  userName: string | null;
  role: ChecklistRole;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  parentId: string | null;
  title: string;
  description: string | null;
  position: number;
  completed: boolean;
  completedAt: string | null;
  completedById: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  children: ChecklistItem[];
}

export interface Checklist {
  id: string;
  title: string;
  position: number;
  ownerId: string;
  ownerName: string | null;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
  members: ChecklistMember[];
  items: ChecklistItem[];
}

export interface CreateChecklistRequest {
  title: string;
  position?: number;
  teamId?: string | null;
}

export interface UpdateChecklistRequest {
  title?: string;
  position?: number;
}

export interface CreateChecklistItemRequest {
  title: string;
  description?: string;
  parentId?: string | null;
  dueDate?: string | null;
  position?: number;
}

export interface UpdateChecklistItemRequest {
  title?: string;
  description?: string;
  dueDate?: string | null;
  position?: number;
}

export interface AddChecklistMemberRequest {
  userId: string;
}

export interface MoveChecklistItemRequest {
  targetChecklistId: string;
  position: number;
}
