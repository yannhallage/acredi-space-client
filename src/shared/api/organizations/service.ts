import { http } from "../http";
import { organizationEndpoints } from "./endpoints";
import type {
  ApiResponse,
  OrganizationResponse,
  UpdateOrganizationRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const organizationService = {
  async findCurrent(): Promise<OrganizationResponse> {
    const response = await http.get<ApiResponse<OrganizationResponse[]>>(
      organizationEndpoints.findAll
    );
    const organizations = unwrapApiResponse(response) ?? [];
    if (!organizations.length) {
      throw new Error("Organisation introuvable");
    }
    return organizations[0];
  },

  async update(
    id: string,
    request: UpdateOrganizationRequest
  ): Promise<OrganizationResponse> {
    const response = await http.put<ApiResponse<OrganizationResponse>>(
      organizationEndpoints.update(id),
      request
    );
    return unwrapApiResponse(response);
  },
};
