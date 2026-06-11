import { http } from "../http";
import { userEndpoints } from "./endpoints";
import { normalizeUser, normalizeUsers } from "./normalizers";
import type {
  ApiResponse,
  ChangePasswordRequest,
  CreateUserRequest,
  InviteUserRequest,
  RolePermissionsResponse,
  UpdateProfileRequest,
  UpdateUserRequest,
  UserResponse,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const userService = {
  async activate(id: string) {
    const response = await http.post<ApiResponse<UserResponse>>(
      userEndpoints.activate(id)
    );

    return normalizeUser(unwrapApiResponse(response));
  },

  async changeMyPassword(request: ChangePasswordRequest) {
    const response = await http.put<ApiResponse<UserResponse>>(
      userEndpoints.changeMyPassword,
      request
    );

    return normalizeUser(unwrapApiResponse(response));
  },

  async create(request: CreateUserRequest) {
    const response = await http.post<ApiResponse<UserResponse>>(
      userEndpoints.create,
      request
    );

    return normalizeUser(unwrapApiResponse(response));
  },

  async deactivate(id: string) {
    const response = await http.post<ApiResponse<UserResponse>>(
      userEndpoints.deactivate(id)
    );

    return normalizeUser(unwrapApiResponse(response));
  },

  async delete(id: string) {
    await http.delete<ApiResponse<void>>(userEndpoints.delete(id));
  },

  async findAll() {
    const response = await http.get<ApiResponse<UserResponse[]>>(
      userEndpoints.findAll
    );

    return normalizeUsers(unwrapApiResponse(response));
  },

  async findById(id: string) {
    const response = await http.get<ApiResponse<UserResponse>>(
      userEndpoints.findById(id)
    );

    return normalizeUser(unwrapApiResponse(response));
  },

  async invite(request: InviteUserRequest) {
    const response = await http.post<ApiResponse<UserResponse>>(
      userEndpoints.invite,
      request
    );

    return normalizeUser(unwrapApiResponse(response));
  },

  async me() {
    const response = await http.get<ApiResponse<UserResponse>>(
      userEndpoints.me
    );

    return normalizeUser(unwrapApiResponse(response));
  },

  async myPermissions() {
    const response = await http.get<ApiResponse<RolePermissionsResponse>>(
      userEndpoints.myPermissions
    );

    return unwrapApiResponse(response);
  },

  async update(id: string, request: UpdateUserRequest) {
    const response = await http.put<ApiResponse<UserResponse>>(
      userEndpoints.update(id),
      request
    );

    return normalizeUser(unwrapApiResponse(response));
  },

  async updateProfile(request: UpdateProfileRequest) {
    const response = await http.put<ApiResponse<UserResponse>>(
      userEndpoints.updateProfile,
      request
    );

    return normalizeUser(unwrapApiResponse(response));
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await http.put<ApiResponse<UserResponse>>(
      userEndpoints.uploadAvatar,
      formData
    );

    return normalizeUser(unwrapApiResponse(response));
  },
};