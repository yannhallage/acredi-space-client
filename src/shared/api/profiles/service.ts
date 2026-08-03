import { http } from "../http";
import { profileEndpoints } from "./endpoints";
import type { ApiResponse, CreateProfileRequest, ProfileResponse } from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const profileService = {
  async create(request: CreateProfileRequest): Promise<ProfileResponse> {
    const response = await http.post<ApiResponse<ProfileResponse>>(
      profileEndpoints.create,
      request
    );

    return unwrapApiResponse(response);
  },

  async delete(id: string): Promise<void> {
    await http.delete<ApiResponse<void>>(profileEndpoints.delete(id));
  },

  async findAll(): Promise<ProfileResponse[]> {
    const response = await http.get<ApiResponse<ProfileResponse[]>>(
      profileEndpoints.findAll
    );

    return unwrapApiResponse(response);
  },
};
