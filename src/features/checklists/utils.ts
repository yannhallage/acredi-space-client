import type { Checklist, ChecklistItem } from "../../shared/api/checklists";

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function dueDateInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toDueDatePayload(value: string) {
  return `${value}T00:00:00`;
}

export function formatDueDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return "Aujourd'hui";
  }
  if (diffDays === 1) {
    return "Demain";
  }
  if (diffDays === -1) {
    return "Hier";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function isOverdue(value: string | null | undefined, completed: boolean) {
  if (!value || completed) {
    return false;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() < Date.now();
}

export function isChecklistOwner(
  list: { ownerId?: string; members: { userId: string; role: string }[] },
  userId: string | undefined,
) {
  if (!userId) return false;
  if (list.ownerId === userId) return true;
  return list.members.some(
    (member) => member.userId === userId && member.role === "OWNER",
  );
}

export function isChecklistParticipant(
  list: { ownerId?: string; members: { userId: string; role: string }[] },
  userId: string | undefined,
) {
  if (!userId || isChecklistOwner(list, userId)) return false;
  return list.members.some(
    (member) => member.userId === userId && member.role === "EDITOR",
  );
}

export function findChecklistItem(
  lists: Checklist[],
  listId: string,
  itemId: string,
): ChecklistItem | null {
  const list = lists.find((entry) => entry.id === listId);
  if (!list) return null;

  for (const item of list.items) {
    if (item.id === itemId) return item;
    const child = item.children?.find((entry) => entry.id === itemId);
    if (child) return child;
  }

  return null;
}
