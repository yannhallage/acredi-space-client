import type { AdminRole, User } from "../../shared/types";
import type { IconName } from "../../shared/ui";

export const ROLE_OPTIONS: Array<{ value: AdminRole; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "collaborator", label: "Collaborator" },
];

export function roleLabel(user: User) {
  if (user.adminRole === "admin" || user.adminRole === "owner") {
    return "Admin";
  }

  if (user.adminRole === "manager") {
    return "Manager";
  }

  return "Collaborator";
}

export function roleIcon(user: User): IconName {
  return user.adminRole === "admin" || user.adminRole === "owner"
    ? "shield"
    : "users";
}

export function getInviteErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      response?: { data?: { message?: unknown } };
    };
    const responseMessage = maybeError.response?.data?.message;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return "Failed to invite user";
}

export function adminRoleFromUser(user: User): AdminRole {
  if (user.adminRole === "admin" || user.adminRole === "owner") {
    return "admin";
  }

  if (user.adminRole === "manager") {
    return "manager";
  }

  return "collaborator";
}

export function roleNameFromAdminRole(
  role: AdminRole,
): "ADMIN" | "MANAGER" | "COLLABORATOR" {
  if (role === "admin" || role === "owner") {
    return "ADMIN";
  }

  if (role === "manager") {
    return "MANAGER";
  }

  return "COLLABORATOR";
}
