import type { AdminRole, Presence, User } from "../../types";
import type { NormalizedUserOptions, UserResponse } from "./types";

const adminRoles: AdminRole[] = [
  "admin",
  "manager",
  "collaborator",
  "owner",
  "member",
  "guest",
];
const presenceValues: Presence[] = ["online", "busy", "dnd", "offline"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readId(value: unknown) {
  if (typeof value === "number") {
    return String(value);
  }

  return readString(value);
}

function normalizeAdminRole(
  value: unknown,
  fallback: AdminRole = "collaborator"
) {
  const role = readString(value)?.toLowerCase();

  if (!role) {
    return fallback;
  }

  const exactMatch = adminRoles.find((item) => item === role);

  if (exactMatch) {
    return exactMatch;
  }

  if (role.includes("owner")) return "owner";
  if (role.includes("admin")) return "admin";
  if (role.includes("manager")) return "manager";
  if (role.includes("collaborator")) return "collaborator";
  if (role.includes("guest")) return "guest";

  return "collaborator";
}

function normalizePresence(
  payload: UserResponse,
  fallback: Presence = "online"
): Presence {
  if (presenceValues.includes(payload.presence as Presence)) {
    return payload.presence as Presence;
  }

  if (payload.enabled === false) {
    return "offline";
  }

  return fallback;
}

function buildName(payload: UserResponse) {
  const nameFromParts = [payload.firstName, payload.lastName]
    .map(readString)
    .filter(Boolean)
    .join(" ");

  return (
    readString(payload.name) ??
    readString(payload.fullName) ??
    readString(nameFromParts) ??
    readString(payload.email) ??
    "Utilisateur"
  );
}

function buildTeam(payload: UserResponse) {
  return (
    readString(payload.team) ??
    readString(payload.teamName) ??
    (isRecord(payload.profile) ? readString(payload.profile.team) : undefined) ??
    (isRecord(payload.profile) ? readString(payload.profile.teamName) : undefined) ??
    "Acredi Space"
  );
}

function buildProfile(payload: UserResponse) {
  if (typeof payload.profile === "string") {
    return readString(payload.profile);
  }

  if (isRecord(payload.profile)) {
    const profileName =
      readString(payload.profile.name) ??
      readString(payload.profile.role) ??
      readString(payload.profile.team);

    if (profileName) {
      return {
        ...payload.profile,
        role: readString(payload.profile.role) ?? profileName,
      };
    }
  }

  return undefined;
}

function buildRole(payload: UserResponse) {
  return (
    readString(payload.role) ??
    (isRecord(payload.profile) ? readString(payload.profile.role) : undefined) ??
    "Utilisateur"
  );
}

function buildStatus(payload: UserResponse) {
  const status = readString(payload.status);

  if (status) {
    return status;
  }

  if (payload.enabled === false) {
    return "Inactif";
  }

  if (
    payload.onboardingStatus &&
    payload.onboardingStatus.toUpperCase() !== "COMPLETED"
  ) {
    return "Invitation envoyee";
  }

  return "Disponible";
}

export function normalizeUser(
  value: unknown,
  options: NormalizedUserOptions = {}
): User {
  const payload = isRecord(value) ? (value as UserResponse) : {};
  const email = readString(payload.email) ?? "";
  const adminRole = normalizeAdminRole(payload.adminRole ?? payload.role, options.fallbackAdminRole);

  return {
    id: readId(payload.id) ?? readId(payload.userId) ?? readId(payload.uuid) ?? email,
    name: buildName(payload),
    email,
    role: buildRole(payload),
    team: buildTeam(payload),
    presence: normalizePresence(payload, options.fallbackPresence),
    status: buildStatus(payload),
    appThemePreference: readString(payload.appThemePreference),
    avatarUrl: readString(payload.avatarUrl),
    enabled: payload.enabled ?? true,
    invitationStatus: readString(payload.invitationStatus),
    onboardingStatus: readString(payload.onboardingStatus),
    phoneNumber: readString(payload.phoneNumber),
    profile: buildProfile(payload),
    adminRole,
  };
}

export function normalizeUsers(values: unknown) {
  return Array.isArray(values) ? values.map((value) => normalizeUser(value)) : [];
}
