import { http } from "../http";
import { discussionEndpoints } from "./endpoints";
import type {
  ApiResponse,
  CreateGroupDiscussionRequest,
  GroupDiscussionMemberResponse,
  GroupDiscussionResponse,
  GroupMessageResponse,
  SendGroupMessageRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export function formatDiscussionMemberName(
  member: Pick<
    GroupDiscussionMemberResponse,
    "name" | "firstName" | "lastName" | "email"
  >
) {
  if (member.name?.trim()) {
    return member.name.trim();
  }

  const firstName = member.firstName?.trim() ?? "";
  const lastName = member.lastName?.trim() ?? "";

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  if (lastName) {
    return lastName;
  }

  return member.email?.trim() || "Membre";
}

export const discussionService = {
  async findMine() {
    const response = await http.get<ApiResponse<GroupDiscussionResponse[]>>(
      discussionEndpoints.mine
    );

    return unwrapApiResponse(response);
  },

  async findByTeam(teamId: string) {
    const response = await http.get<ApiResponse<GroupDiscussionResponse[]>>(
      discussionEndpoints.byTeam(teamId)
    );

    return unwrapApiResponse(response);
  },

  async findById(id: string) {
    const response = await http.get<ApiResponse<GroupDiscussionResponse>>(
      discussionEndpoints.byId(id)
    );

    return unwrapApiResponse(response);
  },

  async createForTeam(teamId: string, request: CreateGroupDiscussionRequest) {
    const response = await http.post<ApiResponse<GroupDiscussionResponse>>(
      discussionEndpoints.createForTeam(teamId),
      request
    );

    return unwrapApiResponse(response);
  },

  async findMessages(discussionId: string) {
    const response = await http.get<ApiResponse<GroupMessageResponse[]>>(
      discussionEndpoints.messages(discussionId)
    );

    return unwrapApiResponse(response);
  },

  async sendMessage(discussionId: string, request: SendGroupMessageRequest) {
    const response = await http.post<ApiResponse<GroupMessageResponse>>(
      discussionEndpoints.messages(discussionId),
      request
    );

    return unwrapApiResponse(response);
  },
};
