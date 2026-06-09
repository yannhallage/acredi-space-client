import type { ApiResponse } from "../../shared/api/api";
import type { UserResponse } from "../../shared/api/users/types";
import type { User } from "../../shared/types";

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
  ownerName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  membersCount?: number;
};

export type TeamMemberResponse = {
  id: string;
  teamId?: string;
  team_id?: string;
  userId?: string;
  user_id?: string;
  roleName?: TeamMemberRole;
  role_name?: TeamMemberRole;
  joinedAt?: string;
  joined_at?: string;
  user?: UserResponse | null;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  avatarUrl: string | null;
  ownerId: string;
  ownerName: string | null;
  membersCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  roleName: TeamMemberRole;
  joinedAt: Date;
  user: User | null;
};

export type { ApiResponse };
