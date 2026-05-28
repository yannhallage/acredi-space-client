export type UserRole = "ADMIN" | "MANAGER" | "USER";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}