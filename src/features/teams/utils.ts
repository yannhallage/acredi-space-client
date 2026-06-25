import type { User } from "../../shared/types";

export function userPresenceLabel(user: Pick<User, "enabled" | "presence">) {
  return user.enabled === false || user.presence === "offline"
    ? "Inactif"
    : "Disponible";
}

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getErrorMessage(
  error: unknown,
  fallback = "Une erreur est survenue.",
) {
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

  return fallback;
}
