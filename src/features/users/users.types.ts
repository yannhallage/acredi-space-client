export type RoleName = "ADMIN" | "MANAGER" | "USER";

export interface InviteUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleName: RoleName;
  profileId?: string;
}