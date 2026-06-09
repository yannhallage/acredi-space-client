import type { User } from "../../types";
import { normalizeAuthUser } from "./normalizers";
import type {
  AuthPermissions,
  AuthResponse,
  LoginRequest,
  LoginResponse,
  OtpLoginResponse,
} from "./types";

export interface OtpSession {
  email: string;
  challengeId?: string;
  trustDevice?: boolean;
}

export interface PersistAuthSessionOptions {
  persistTrustedDevice?: boolean;
  trustedDeviceEmail?: string;
}

export const authStorageKeys = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  session: "acredi-session",
  user: "acredi-user",
  permissions: "acredi-permissions",
  otpSession: "otp-session",
  trustedDeviceToken: "acredi-trusted-device-token",
  trustedDeviceExpiresAt: "acredi-trusted-device-expires-at",
  trustedDeviceEmail: "acredi-trusted-device-email",
} as const;

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function isTrustedDeviceExpired(expiresAt: string | null) {
  if (!expiresAt) {
    return false;
  }

  const expiresAtTime = Date.parse(expiresAt);

  return Number.isNaN(expiresAtTime) ? false : expiresAtTime <= Date.now();
}

export function clearTrustedDevice() {
  localStorage.removeItem(authStorageKeys.trustedDeviceToken);
  localStorage.removeItem(authStorageKeys.trustedDeviceExpiresAt);
  localStorage.removeItem(authStorageKeys.trustedDeviceEmail);
}

export function getTrustedDeviceToken() {
  const token = localStorage.getItem(authStorageKeys.trustedDeviceToken);
  const expiresAt = localStorage.getItem(authStorageKeys.trustedDeviceExpiresAt);

  if (!token) {
    return undefined;
  }

  if (isTrustedDeviceExpired(expiresAt)) {
    clearTrustedDevice();
    return undefined;
  }

  return token;
}

export function withTrustedDevice(request: LoginRequest): LoginRequest {
  const { useTrustedDevice = true, ...loginRequest } = request;

  if (!useTrustedDevice) {
    return loginRequest;
  }

  const trustedDeviceToken = getTrustedDeviceToken();

  return trustedDeviceToken
    ? { ...loginRequest, trustedDeviceToken }
    : loginRequest;
}

export function isAuthResponse(response: unknown): response is AuthResponse {
  return (
    response !== null &&
    typeof response === "object" &&
    ("accessToken" in response || "token" in response)
  );
}

export function getLoginAuthResponse(response: LoginResponse) {
  if (isAuthResponse(response)) {
    return response;
  }

  if (isAuthResponse(response.auth)) {
    return response.auth;
  }

  return null;
}

export function buildOtpSession(
  response: OtpLoginResponse,
  fallbackEmail: string
): OtpSession {
  return {
    email: response.email ?? fallbackEmail,
    challengeId: response.challengeId ?? response.otpId,
  };
}

export function persistOtpSession(session: OtpSession) {
  localStorage.setItem(authStorageKeys.otpSession, JSON.stringify(session));
}

export function getOtpSession() {
  return parseJson<OtpSession>(localStorage.getItem(authStorageKeys.otpSession));
}

export function clearOtpSession() {
  localStorage.removeItem(authStorageKeys.otpSession);
}

export function getStoredUser() {
  const user = parseJson<unknown>(localStorage.getItem(authStorageKeys.user));

  return user ? normalizeAuthUser(user) : null;
}

export function getStoredPermissions() {
  return parseJson<AuthPermissions>(
    localStorage.getItem(authStorageKeys.permissions)
  );
}

export function persistAuthSession(
  response: AuthResponse,
  options: PersistAuthSessionOptions = {}
) {
  const persistTrustedDevice = options.persistTrustedDevice ?? true;
  const accessToken = response.accessToken ?? response.token;

  if (!accessToken) {
    throw new Error("Token d'authentification absent");
  }

  if (!response.user) {
    throw new Error("Utilisateur authentifie absent");
  }

  const user: User = normalizeAuthUser(response.user);

  localStorage.setItem(authStorageKeys.accessToken, accessToken);
  localStorage.setItem(authStorageKeys.user, JSON.stringify(user));
  localStorage.setItem(authStorageKeys.session, "active");
  clearOtpSession();

  if (response.refreshToken) {
    localStorage.setItem(authStorageKeys.refreshToken, response.refreshToken);
  }

  if (response.permissions) {
    localStorage.setItem(
      authStorageKeys.permissions,
      JSON.stringify(response.permissions)
    );
  }

  if (!persistTrustedDevice) {
    clearTrustedDevice();
  } else if (response.trustedDeviceToken) {
    localStorage.setItem(
      authStorageKeys.trustedDeviceToken,
      response.trustedDeviceToken
    );
    localStorage.setItem(
      authStorageKeys.trustedDeviceEmail,
      options.trustedDeviceEmail ?? user.email
    );
  }

  if (persistTrustedDevice && response.trustedDeviceExpiresAt) {
    localStorage.setItem(
      authStorageKeys.trustedDeviceExpiresAt,
      response.trustedDeviceExpiresAt
    );
  }

  return user;
}

export function clearAuthSession() {
  localStorage.removeItem(authStorageKeys.accessToken);
  localStorage.removeItem(authStorageKeys.refreshToken);
  localStorage.removeItem(authStorageKeys.session);
  localStorage.removeItem(authStorageKeys.user);
  localStorage.removeItem(authStorageKeys.permissions);
  clearOtpSession();
}
