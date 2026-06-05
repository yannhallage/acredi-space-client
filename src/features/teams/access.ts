import type { AdminRole } from "../../shared/types";

export const MY_TEAMS_ALLOWED_ROLES = ["collaborator", "manager"] as const;
export const ALL_TEAMS_ALLOWED_ROLES = ["admin", "manager", "owner"] as const;

export function canAccessMyTeams(role: AdminRole | null | undefined) {
  return role === "collaborator" || role === "manager";
}

export function canAccessAllTeams(role: AdminRole | null | undefined) {
  return role === "admin" || role === "manager" || role === "owner";
}
