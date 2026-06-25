import type { User } from "../../shared/types";
import { TEAM_COLORS } from "./constants";
import type { TeamMemberRole } from "./types";

export type DraftTeamMember = {
  roleName: TeamMemberRole;
  user: User;
};

export type TeamFormState = {
  avatarUrl: string;
  description: string;
  members: DraftTeamMember[];
  name: string;
  teamColor: string;
};

export function createInitialTeamForm(): TeamFormState {
  return {
    avatarUrl: "",
    description: "",
    members: [],
    name: "",
    teamColor: TEAM_COLORS[0],
  };
}
