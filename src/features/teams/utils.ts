import type { User } from "../../shared/types";
import { getFriendlyErrorMessage } from "../../shared/feedback";

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
  return getFriendlyErrorMessage(error, fallback);
}
