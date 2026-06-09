import { http } from "../http";
import { profileEndpoints } from "./endpoints";
import type { ApiResponse, ProfileResponse } from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const profileService = {
  async findAll(): Promise<ProfileResponse[]> {
    const response = await http.get<ApiResponse<ProfileResponse[]>>(
      profileEndpoints.findAll
    );

    return unwrapApiResponse(response);
  },
};
