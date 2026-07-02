export type RoleName = "ADMIN" | "MANAGER" | "COLLABORATOR";

export interface InviteUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleName: RoleName;
  profileId?: string;
}
