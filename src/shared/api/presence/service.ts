import { http } from "../http";
import { presenceEndpoints } from "./endpoints";
import type { ApiResponse, PresenceResponse, UpdatePresenceRequest } from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const presenceService = {
  async findAll() {
    const response = await http.get<ApiResponse<PresenceResponse[]>>(
      presenceEndpoints.findAll
    );

    return unwrapApiResponse(response);
  },

  async updateMe(request: UpdatePresenceRequest) {
    const response = await http.put<ApiResponse<PresenceResponse>>(
      presenceEndpoints.updateMe,
      request
    );

    return unwrapApiResponse(response);
  },
};
