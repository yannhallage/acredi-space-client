export interface TeamResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  teamColor: string;
  avatarUrl?: string | null;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  teamColor?: string;
  avatarUrl?: string;
  members?: AddTeamMemberRequest[];
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  teamColor?: string;
  avatarUrl?: string;
}

export interface AddTeamMemberRequest {
  id: string;
}

export interface TeamApiResponse {
  data: TeamResponse;
  message: string;
}

export interface TeamsListApiResponse {
  data: TeamResponse[];
  message: string;
}
