import type { TeamMember, TeamMemberRole } from "./types";

export const roleLabels: Record<TeamMemberRole, string> = {
  ADMIN: "Admin",
  COLLABORATOR: "Collaborateur",
  MANAGER: "Manager",
};

export function memberDisplayName(member: TeamMember) {
  return member.user?.name || member.userId || "Utilisateur";
}

export function memberDisplayEmail(member: TeamMember) {
  return member.user?.email || "—";
}
