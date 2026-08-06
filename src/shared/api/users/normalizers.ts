import type { AdminRole, Presence, User } from "../../types";
import { readCachedPresence } from "../presence/store";
import type { NormalizedUserOptions, UserResponse } from "./types";

const adminRoles: AdminRole[] = [
  "admin",
  "manager",
  "collaborator",
  "owner",
  "member",
  "guest",
];
const adminRoleRank: Record<AdminRole, number> = {
  guest: 0,
  member: 1,
  collaborator: 2,
  manager: 3,
  admin: 4,
  owner: 5,
};
const presenceValues: Presence[] = ["online", "busy", "away", "dnd", "offline"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readFirstString(
  source: Record<string, unknown>,
  keys: readonly string[]
) {
  for (const key of keys) {
    const value = readString(source[key]);

    if (value) {
      return value;
    }
  }

  return undefined;
}

function readId(value: unknown) {
  if (typeof value === "number") {
    return String(value);
  }

  return readString(value);
}

function readAdminRole(value: unknown): AdminRole | undefined {
  const role = readString(value)?.toLowerCase();

  if (!role) {
    return undefined;
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

  return undefined;
}

function buildAdminRole(
  payload: UserResponse,
  fallback: AdminRole = "collaborator"
) {
  const roles = [readAdminRole(payload.adminRole), readAdminRole(payload.role)]
    .filter((role): role is AdminRole => Boolean(role))
    .sort((left, right) => adminRoleRank[right] - adminRoleRank[left]);

  if (roles[0]) {
    return roles[0];
  }

  return fallback;
}

function normalizePresence(
  payload: UserResponse,
  fallback: Presence = "offline"
): Presence {
  const payloadPresence = readString(payload.presence)?.toLowerCase();

  if (presenceValues.includes(payloadPresence as Presence)) {
    return payloadPresence as Presence;
  }

  if (payload.enabled === false) {
    return "offline";
  }

  const userId = readId(payload.id) ?? readId(payload.userId) ?? readId(payload.uuid);
  const cachedPresence = readCachedPresence(userId);
  if (cachedPresence) {
    return cachedPresence;
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

function buildAvatarUrl(payload: UserResponse) {
  const source = payload as Record<string, unknown>;
  const directAvatarUrl = readFirstString(source, [
    "url",
    "path",
    "src",
    "href",
    "avatarUrl",
    "avatarURL",
    "avatar",
    "photoUrl",
    "photoURL",
    "photo",
    "pictureUrl",
    "pictureURL",
    "picture",
    "imageUrl",
    "imageURL",
    "profileImageUrl",
    "profileImageURL",
    "profilePictureUrl",
    "profilePictureURL",
  ]);

  if (directAvatarUrl) {
    return directAvatarUrl;
  }

  if (isRecord(source.avatar)) {
    return readFirstString(source.avatar, ["url", "path", "src", "href"]);
  }

  if (isRecord(source.profile)) {
    return readFirstString(source.profile, [
      "avatarUrl",
      "avatarURL",
      "avatar",
      "photoUrl",
      "photoURL",
      "pictureUrl",
      "pictureURL",
      "imageUrl",
      "imageURL",
    ]);
  }

  return undefined;
}

export function normalizeUser(
  value: unknown,
  options: NormalizedUserOptions = {}
): User {
  const payload = isRecord(value) ? (value as UserResponse) : {};
  const email = readString(payload.email) ?? "";
  const adminRole = buildAdminRole(payload, options.fallbackAdminRole);

  return {
    id: readId(payload.id) ?? readId(payload.userId) ?? readId(payload.uuid) ?? email,
    name: buildName(payload),
    email,
    role: buildRole(payload),
    team: buildTeam(payload),
    presence: normalizePresence(payload, options.fallbackPresence),
    status: buildStatus(payload),
    appThemePreference: readString(payload.appThemePreference),
    avatarUrl: buildAvatarUrl(payload),
    enabled: payload.enabled ?? true,
    invitationStatus: readString(payload.invitationStatus),
    onboardingStatus: readString(payload.onboardingStatus),
    phoneNumber: readString(payload.phoneNumber),
    profile: buildProfile(payload),
    organizationId:
      readId(payload.organizationId) ??
      (isRecord(payload.organization) ? readId(payload.organization.id) : undefined) ??
      null,
    organizationName:
      (isRecord(payload.organization) ? readString(payload.organization.name) : undefined) ??
      null,
    adminRole,
  };
}

export function normalizeUsers(values: unknown) {
  return Array.isArray(values) ? values.map((value) => normalizeUser(value)) : [];
}

export function normalizeAvatarUpdate(value: unknown): Partial<User> {
  const stringAvatarUrl = readString(value);

  if (stringAvatarUrl) {
    return { avatarUrl: stringAvatarUrl };
  }

  if (!isRecord(value)) {
    return {};
  }

  const avatarUrl = buildAvatarUrl(value as UserResponse);

  return avatarUrl ? { avatarUrl } : {};
}
