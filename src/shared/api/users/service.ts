import { http, resolveApiUrl } from "../http";
import { userEndpoints } from "./endpoints";
import { normalizeAvatarUpdate, normalizeUser, normalizeUsers } from "./normalizers";
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

function unwrapMaybeApiResponse<TData>(response: ApiResponse<TData> | TData) {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<TData>).data;
  }

  return response as TData;
}

async function parseAvatarResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as unknown;
    const avatarUpdate = normalizeAvatarUpdate(unwrapMaybeApiResponse(payload));

    return avatarUpdate.avatarUrl ?? null;
  }

  if (contentType.startsWith("image/") || contentType.includes("octet-stream")) {
    return resolveApiUrl(userEndpoints.uploadAvatar);
  }

  const text = (await response.text()).trim();

  if (!text) {
    return null;
  }

  const avatarUpdate = normalizeAvatarUpdate(text);

  return avatarUpdate.avatarUrl ?? null;
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

  async myAvatarUrl() {
    const response = await http.raw(userEndpoints.uploadAvatar, {
      headers: {
        Accept: "image/*, application/json, text/plain, */*",
      },
    });

    return parseAvatarResponse(response);
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

    const response = await http.put<ApiResponse<UserResponse | string | null> | UserResponse | string | null>(
      userEndpoints.uploadAvatar,
      formData
    );
    const uploadedAvatar = normalizeAvatarUpdate(unwrapMaybeApiResponse(response));

    if (uploadedAvatar.avatarUrl) {
      return uploadedAvatar;
    }

    const dedicatedAvatarUrl = await userService.myAvatarUrl().catch(() => null);

    if (dedicatedAvatarUrl) {
      return { avatarUrl: dedicatedAvatarUrl };
    }

    const updatedUser = await userService.me();

    if (!updatedUser.avatarUrl) {
      throw new Error("L'API n'a pas renvoye l'URL de l'image.");
    }

    return { avatarUrl: updatedUser.avatarUrl };
  },
};
