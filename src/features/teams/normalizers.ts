import type { Team, TeamResponse } from "./types";

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