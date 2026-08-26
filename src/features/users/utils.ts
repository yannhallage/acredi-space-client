import { getFriendlyErrorMessage } from "../../shared/feedback";
import type { AdminRole, Presence, User } from "../../shared/types";
import type { IconName } from "../../shared/ui";

export const ROLE_OPTIONS: Array<{ value: AdminRole; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "collaborator", label: "Collaborator" },
];

export function roleLabel(user: User) {
  if (user.adminRole === "admin" || user.adminRole === "owner") {
    return "Admin";
  }

  if (user.adminRole === "manager") {
    return "Manager";
  }

  return "Collaborator";
}

export function roleIcon(user: User): IconName {
  return user.adminRole === "admin" || user.adminRole === "owner"
    ? "shield"
    : "users";
}

export function presenceLabel(presence: Presence) {
  if (presence === "busy") {
    return "Occupe";
  }

  if (presence === "dnd") {
    return "Ne pas deranger";
  }

  if (presence === "away") {
    return "Absent";
  }

  if (presence === "offline") {
    return "Hors ligne";
  }

  return "Disponible";
}

export function themePreferenceLabel(value?: string | null) {
  if (!value) {
    return "Non renseigne";
  }

  const normalized = value.toUpperCase();

  if (normalized === "DARK") {
    return "Sombre";
  }

  if (normalized === "LIGHT") {
    return "Clair";
  }

  return value;
}

export function getInviteErrorMessage(error: unknown) {
  return getFriendlyErrorMessage(error, "Impossible d'inviter cet utilisateur.");
}

export function adminRoleFromUser(user: User): AdminRole {
  if (user.adminRole === "admin" || user.adminRole === "owner") {
    return "admin";
  }

  if (user.adminRole === "manager") {
    return "manager";
  }

  return "collaborator";
}

export function roleNameFromAdminRole(
  role: AdminRole,
): "ADMIN" | "MANAGER" | "COLLABORATOR" {
  if (role === "admin" || role === "owner") {
    return "ADMIN";
  }

  if (role === "manager") {
    return "MANAGER";
  }

  return "COLLABORATOR";
}
