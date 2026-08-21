import { http } from "../http";
import { discussionEndpoints } from "./endpoints";
import type { MessageResponse } from "../dm/types";
import type {
  ApiResponse,
  CreateGroupDiscussionRequest,
  GroupDiscussionMemberResponse,
  GroupDiscussionResponse,
  GroupMessagePageParams,
  GroupMessagePageResponse,
  GroupMessageResponse,
  SendGroupMessageRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

// export function formatDiscussionMemberName(
//   member: Pick<
//     GroupDiscussionMemberResponse,
//     "name" | "firstName" | "lastName" | "email"
//   >
// ) {
//   if (member.name?.trim()) {
//     return member.name.trim();
//   }

//   const firstName = member.firstName?.trim() ?? "";
//   const lastName = member.lastName?.trim() ?? "";

//   if (firstName && lastName) {
//     return `${firstName} ${lastName}`;
//   }

//   if (firstName) {
//     return firstName;
//   }

//   if (lastName) {
//     return lastName;
//   }

//   return member.email?.trim() || "Membre";
// }


export function formatDiscussionMemberName(
  member: Pick<
    GroupDiscussionMemberResponse,
    "displayName" | "name" | "firstName" | "lastName" | "email"
  >
) {
  if (member.displayName?.trim()) {
    return member.displayName.trim();
  }

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

  async findMessages(
    discussionId: string,
    params?: GroupMessagePageParams
  ) {
    const response = await http.get<ApiResponse<GroupMessagePageResponse>>(
      discussionEndpoints.messages(discussionId),
      {
        params: {
          before: params?.before,
          beforeId: params?.beforeId,
          limit: params?.limit,
        },
      }
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

  async deleteMessage(discussionId: string, messageId: string) {
    const response = await http.delete<ApiResponse<GroupMessageResponse>>(
      discussionEndpoints.message(discussionId, messageId)
    );

    return unwrapApiResponse(response);
  },

  async updateMessage(
    discussionId: string,
    messageId: string,
    content: string
  ) {
    const response = await http.patch<ApiResponse<GroupMessageResponse>>(
      discussionEndpoints.message(discussionId, messageId),
      { content }
    );

    return unwrapApiResponse(response);
  },

  async shareMessage(
    discussionId: string,
    messageId: string,
    request: { userId?: string; discussionId?: string }
  ) {
    const response = await http.post<
      ApiResponse<MessageResponse | GroupMessageResponse>
    >(discussionEndpoints.shareMessage(discussionId, messageId), request);

    return unwrapApiResponse(response);
  },
};
