import { normalizeUser } from "../../shared/api/users/normalizers";
import type { Team, TeamMember, TeamMemberResponse, TeamResponse } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function normalizeTeam(team: TeamResponse): Team {
  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    description: team.description ?? "",
    color: team.teamColor ?? "#6366F1",
    avatarUrl: team.avatarUrl ?? null,
    ownerId: team.ownerId,
    membersCount: team.membersCount ?? 0,
    createdAt: new Date(team.createdAt),
    updatedAt: new Date(team.updatedAt),
  };
}

export function normalizeTeams(teams: TeamResponse[]): Team[] {
  return teams.map(normalizeTeam);
}

export function normalizeTeamMember(member: TeamMemberResponse): TeamMember {
  const teamId = member.teamId ?? member.team_id ?? "";
  const userId = member.userId ?? member.user_id ?? "";

  return {
    id: member.id || `${teamId}-${userId}`,
    teamId,
    userId,
    roleName: member.roleName ?? member.role_name ?? "COLLABORATOR",
    joinedAt: new Date(member.joinedAt ?? member.joined_at ?? Date.now()),
    user: member.user ? normalizeUser(member.user) : null,
  };
}

export function normalizeTeamMembers(values: unknown): TeamMember[] {
  const members = Array.isArray(values)
    ? values
    : isRecord(values) && Array.isArray(values.members)
      ? values.members
      : [];

  return members.map((member) =>
    normalizeTeamMember(member as TeamMemberResponse)
  );
}
