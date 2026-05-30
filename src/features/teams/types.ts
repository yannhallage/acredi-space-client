import type { ApiResponse } from "../../shared/api/api";

export type TeamMemberRole = "COLLABORATOR" | "MANAGER" | "ADMIN";

export type CreateTeamRequest = {
  name: string;
  description?: string | null;
  teamColor?: string | null;
  avatarUrl?: string | null;
};

export type UpdateTeamRequest = {
  name?: string;
  description?: string | null;
  teamColor?: string | null;
  avatarUrl?: string | null;
};

export type AddTeamMemberRequest = {
  userId: string;
  roleName?: TeamMemberRole;
};

export type TeamResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  teamColor: string | null;
  avatarUrl: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  membersCount?: number;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  avatarUrl: string | null;
  ownerId: string;
  membersCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type { ApiResponse };