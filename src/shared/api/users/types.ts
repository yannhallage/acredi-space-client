import type { AdminRole, Presence, User } from "../../types";

export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
  status?: string;
  success?: boolean;
  timestamp?: string;
}

export interface UserResponse extends Partial<User> {
  appThemePreference?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  enabled?: boolean;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  onboardingStatus?: string;
  phoneNumber?: string | null;
  profile?: {
    role?: string;
    team?: string;
    teamName?: string;
    [key: string]: unknown;
  } | null;
  role?: string;
  teamName?: string;
  userId?: string | number;
  uuid?: string | number;
}

export interface RolePermissionFeature {
  code: string;
  label: string;
  name: string;
}

export interface RolePermissionsResponse {
  features: RolePermissionFeature[];
  role: string;
}

export interface CreateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  password?: string;
  role?: string;
  [key: string]: unknown;
}

export interface InviteUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface UpdateUserRequest {
  email?: string;
  enabled?: boolean;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface UpdateProfileRequest {
  appThemePreference?: string;
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  [key: string]: unknown;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NormalizedUserOptions {
  fallbackAdminRole?: AdminRole;
  fallbackPresence?: Presence;
}
