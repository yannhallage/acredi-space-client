import type { AdminRole, Presence, User } from "../../types";
import type { AuthUserPayload } from "./types";

const presenceValues: Presence[] = ["online", "busy", "dnd", "offline"];
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

function readPresence(value: unknown): Presence {
  return presenceValues.includes(value as Presence) ? (value as Presence) : "online";
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

export function normalizeAuthUser(value: unknown): User {
  const payload = isRecord(value) ? (value as AuthUserPayload) : {};
  const email = readString(payload.email) ?? "";
  const name = buildName(payload);

  return {
    id: readId(payload.id) ?? readId(payload.userId) ?? readId(payload.uuid) ?? email,
    name,
    email,
    role: readString(payload.role) ?? "Utilisateur",
    team: readString(payload.team) ?? "Acredi Space",
    presence: readPresence(payload.presence),
    status: readString(payload.status) ?? "Disponible",
    adminRole: readAdminRole(payload.adminRole ?? payload.role),
  };
}
