import { http } from "../../shared/api/http";
import { teamEndpoints } from "./endpoints";
import { normalizeTeam, normalizeTeams } from "./normalizers";

import type {
  AddTeamMemberRequest,
  ApiResponse,
  CreateTeamRequest,
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

  async addMember(teamId: string, request: AddTeamMemberRequest) {
    const response = await http.post<ApiResponse<TeamResponse>>(
      teamEndpoints.addMember(teamId),
      request
    );

    return normalizeTeam(unwrapApiResponse(response));
  },

  async delete(id: string) {
    await http.delete<ApiResponse<void>>(teamEndpoints.delete(id));
  },
};