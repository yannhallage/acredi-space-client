import type { AdminRole, Presence, User } from "../../types";

export type AppThemePreference = "LIGHT" | "DARK";
// export type RoleName = "ADMIN" | "MANAGER" | "USER";
export type RoleName = "ADMIN" | "MANAGER" | "COLLABORATOR";

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
  invitationStatus?: string;
  lastName?: string;
  onboardingStatus?: string;
  organization?: {
    id?: string;
    name?: string;
    slug?: string;
    [key: string]: unknown;
  } | null;
  organizationId?: string | null;
  phoneNumber?: string | null;
  profile?: string | {
    id?: string;
    name?: string;
    description?: string | null;
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
  roleName?: RoleName;
  [key: string]: unknown;
}

export interface InviteUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  roleName?: RoleName;
  [key: string]: unknown;
}

export interface UpdateUserRequest {
  appThemePreference?: AppThemePreference;
  avatarUrl?: string | null;
  email?: string;
  enabled?: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  profileId?: string;
  roleName?: RoleName;
}

export interface UpdateProfileRequest {
  appThemePreference?: AppThemePreference;
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  profileId?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NormalizedUserOptions {
  fallbackAdminRole?: AdminRole;
  fallbackPresence?: Presence;
}
