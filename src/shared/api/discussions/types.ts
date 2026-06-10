export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
}

export interface GroupDiscussionMemberResponse {
  userId: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  roleName?: string | null;
}

export interface GroupDiscussionResponse {
  id: string;
  name: string;
  teamId: string;
  teamName?: string | null;
  teamColor?: string | null;
  description?: string | null;
  createdById?: string | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  members?: GroupDiscussionMemberResponse[];
}

export interface GroupMessageResponse {
  id: string;
  discussionId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
}

export interface SendGroupMessageRequest {
  content: string;
}

export interface CreateGroupDiscussionRequest {
  name: string;
  description?: string;
  memberIds?: string[];
}
