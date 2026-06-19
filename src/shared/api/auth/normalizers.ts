import type { AdminRole, Presence, User } from "../../types";
import { readCachedPresence } from "../presence/store";
import type { AuthUserPayload } from "./types";

const presenceValues: Presence[] = ["online", "busy", "away", "dnd", "offline"];
const adminRoleValues: AdminRole[] = [
  "admin",
  "manager",
  "collaborator",
  "owner",
  "member",
  "guest",
];

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

function readPresence(value: unknown, userId?: string): Presence {
  const presence = readString(value)?.toLowerCase();
  if (presenceValues.includes(presence as Presence)) {
    return presence as Presence;
  }

  return readCachedPresence(userId) ?? "offline";
}

function readAdminRole(value: unknown): AdminRole {
  const role = readString(value)?.toLowerCase();

  if (!role) {
    return "collaborator";
  }

  const exactMatch = adminRoleValues.find((item) => item === role);

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

function buildName(payload: AuthUserPayload) {
  const fromParts = [payload.firstName, payload.lastName]
    .map(readString)
    .filter(Boolean)
    .join(" ");

  return (
    readString(payload.name) ??
    readString(payload.fullName) ??
    readString(fromParts) ??
    readString(payload.email) ??
    "Utilisateur"
  );
}

function buildProfile(payload: AuthUserPayload) {
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

export function normalizeAuthUser(value: unknown): User {
  const payload = isRecord(value) ? (value as AuthUserPayload) : {};
  const email = readString(payload.email) ?? "";
  const id = readId(payload.id) ?? readId(payload.userId) ?? readId(payload.uuid) ?? email;
  const name = buildName(payload);

  return {
    id,
    name,
    email,
    role: readString(payload.role) ?? "Utilisateur",
    team: readString(payload.team) ?? "Acredi Space",
    presence: readPresence(payload.presence, id),
    status: readString(payload.status) ?? "Disponible",
    enabled: payload.enabled !== false,
    onboardingStatus: readString(payload.onboardingStatus),
    invitationStatus: readString(payload.invitationStatus),
    avatarUrl: readString(payload.avatarUrl),
    phoneNumber: readString(payload.phoneNumber),
    appThemePreference: readString(payload.appThemePreference),
    profile: buildProfile(payload),
    adminRole: readAdminRole(payload.adminRole ?? payload.role),
  };
}
