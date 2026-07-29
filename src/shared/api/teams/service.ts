import { http } from "../http";
import { teamEndpoints } from "./endpoints";
import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  TeamResponse,
  UpdateTeamRequest,
} from "./types";

interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
}

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const teamService = {
  async findAll(): Promise<TeamResponse[]> {
    try {
      const response = await http.get<ApiResponse<TeamResponse[]>>(
        teamEndpoints.findAll
      );
      return unwrapApiResponse(response);
    } catch (error) {
      console.error("Teams API Error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      throw error;
    }
  },

  async findByUser(userId: string): Promise<TeamResponse[]> {
    const response = await http.get<ApiResponse<TeamResponse[]>>(
      teamEndpoints.findByUser(userId)
    );
    return unwrapApiResponse(response);
  },

  async create(request: CreateTeamRequest): Promise<TeamResponse> {
    try {
      const response = await http.post<ApiResponse<TeamResponse>>(
        teamEndpoints.create,
        request
      );
      return unwrapApiResponse(response);
    } catch (error) {
      console.error("Create Team API Error:", error);
      throw error;
    }
  },

  async update(
    id: string,
    request: UpdateTeamRequest
  ): Promise<TeamResponse> {
    const response = await http.put<ApiResponse<TeamResponse>>(
      teamEndpoints.update(id),
      request
    );
    return unwrapApiResponse(response);
  },

  async delete(id: string): Promise<void> {
    await http.delete<ApiResponse<void>>(teamEndpoints.delete(id));
  },

  async addMember(
    id: string,
    request: AddTeamMemberRequest
  ): Promise<TeamResponse> {
    const response = await http.post<ApiResponse<TeamResponse>>(
      teamEndpoints.addMember(id),
      request
    );
    return unwrapApiResponse(response);
  },

  async removeMember(id: string, userId: string): Promise<TeamResponse> {
    const response = await http.delete<ApiResponse<TeamResponse>>(
      teamEndpoints.removeMember(id, userId)
    );
    return unwrapApiResponse(response);
  },
};
