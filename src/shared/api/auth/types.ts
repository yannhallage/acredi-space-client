import type { User } from "../../types";

export interface AuthUserPayload extends Partial<User> {
  firstName?: string;
  fullName?: string;
  lastName?: string;
  userId?: string | number;
  uuid?: string | number;
  enabled?: boolean;
  onboardingStatus?: string;
  invitationStatus?: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  appThemePreference?: string;
  profile?: string | {
    id?: string;
    name?: string;
    description?: string | null;
    role?: string;
    team?: string;
    teamName?: string;
    [key: string]: unknown;
  } | null;
}

export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
  status?: string;
  success?: boolean;
  timestamp?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  trustedDeviceToken?: string;
  useTrustedDevice?: boolean;
}

export interface OtpLoginResponse {
  auth?: AuthResponse | null;
  challengeId?: string;
  email?: string;
  expiresAt?: string;
  expiresIn?: number;
  otpRequired?: boolean;
  otpId?: string;
  [key: string]: unknown;
}

export interface PermissionFeature {
  code: string;
  label: string;
  name: string;
}

export interface AuthPermissions {
  features: PermissionFeature[];
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  accessToken?: string;
  expiresIn?: number;
  permissions?: AuthPermissions;
  refreshToken?: string;
  token?: string;
  tokenType?: string;
  trustedDeviceExpiresAt?: string;
  trustedDeviceToken?: string;
  user?: AuthUserPayload;
  [key: string]: unknown;
}

export type LoginResponse = OtpLoginResponse | AuthResponse;

export interface VerifyOtpRequest {
  challengeId?: string;
  code: string;
  email?: string;
  otpId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  confirmPassword?: string;
  newPassword: string;
  token: string;
}
