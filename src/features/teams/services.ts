import { http } from "../../shared/api/http";
import { teamEndpoints } from "./endpoints";
import { normalizeTeam, normalizeTeamMembers, normalizeTeams } from "./normalizers";

import type {
  AddTeamMemberRequest,
  ApiResponse,
  CreateTeamRequest,
  TeamMemberResponse,
  TeamResponse,
  UpdateTeamRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const teamService = {
  async findAll() {
    const response = await http.get<ApiResponse<TeamResponse[]>>(
      teamEndpoints.findAll
    );

    return normalizeTeams(unwrapApiResponse(response));
  },

  async findMine() {
    const response = await http.get<ApiResponse<TeamResponse[]>>(
      teamEndpoints.findMine
    );

    return normalizeTeams(unwrapApiResponse(response));
  },

  async create(request: CreateTeamRequest) {
    const response = await http.post<ApiResponse<TeamResponse>>(
      teamEndpoints.create,
      request
    );

    return normalizeTeam(unwrapApiResponse(response));
  },

  async update(id: string, request: UpdateTeamRequest) {
    const response = await http.put<ApiResponse<TeamResponse>>(
      teamEndpoints.update(id),
      request
    );

    return normalizeTeam(unwrapApiResponse(response));
  },

  async findMembers(teamId: string) {
    const response = await http.get<ApiResponse<TeamMemberResponse[]>>(
      teamEndpoints.members(teamId)
    );

    return normalizeTeamMembers(unwrapApiResponse(response));
  },

  async addMember(teamId: string, request: AddTeamMemberRequest) {
    const response = await http.post<ApiResponse<TeamResponse>>(
      teamEndpoints.addMember(teamId),
      request
    );

    return normalizeTeam(unwrapApiResponse(response));
  },

  async removeMember(teamId: string, userId: string) {
    const response = await http.delete<ApiResponse<TeamResponse>>(
      teamEndpoints.removeMember(teamId, userId)
    );

    return normalizeTeam(unwrapApiResponse(response));
  },

  async delete(id: string) {
    await http.delete<ApiResponse<void>>(teamEndpoints.delete(id));
  },
};
