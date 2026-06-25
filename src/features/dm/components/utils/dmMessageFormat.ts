import type {
  ChatAttachmentResponse,
  MessageResponse,
} from "../../../../shared/api/dm/types";
import type { Presence } from "../../../../shared/types";

export type LocalAttachment = ChatAttachmentResponse & {
  pending?: boolean;
};

export type LocalMessage = MessageResponse & {
  attachments?: LocalAttachment[];
  pending?: boolean;
  failed?: boolean;
};

export function formatTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateSeparator(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Conversation";
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return "Aujourd'hui";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function getPresenceLabel(presence: Presence) {
  switch (presence) {
    case "online":
      return "En ligne";
    case "busy":
      return "Occupe";
    case "away":
      return "Absent";
    case "dnd":
      return "Concentre";
    case "offline":
    default:
      return "Hors ligne";
  }
}

export function formatSubtitle(value: string) {
  const normalized = value.trim().toUpperCase();

  switch (normalized) {
    case "ADMIN":
      return "Admin";
    case "COLLABORATOR":
      return "Collaborateur";
    case "MANAGER":
      return "Manager";
    case "OWNER":
      return "Owner";
    default:
      return value;
  }
}

export function formatAttachmentSize(sizeBytes: number) {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return "0 o";
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} o`;
  }

  const units = ["Ko", "Mo", "Go", "To"];
  let value = sizeBytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getAttachmentExtension(
  attachment: Pick<LocalAttachment, "contentType" | "name">
) {
  const nameExtension = attachment.name.includes(".")
    ? attachment.name.split(".").pop()
    : undefined;
  const mimeExtension = attachment.contentType?.split("/").pop();
  const extension = nameExtension || mimeExtension || "file";

  return extension.slice(0, 8).toUpperCase();
}

export function getAttachmentSignature(
  attachments?: Array<Pick<LocalAttachment, "name" | "sizeBytes">>
) {
  return (attachments ?? [])
    .map((attachment) => `${attachment.name}:${attachment.sizeBytes}`)
    .sort()
    .join("|");
}

export function isSameSelectedFile(firstFile: File, secondFile: File) {
  return (
    firstFile.name === secondFile.name &&
    firstFile.size === secondFile.size &&
    firstFile.lastModified === secondFile.lastModified
  );
}

export function createPendingAttachments(files: File[]): LocalAttachment[] {
  return files.map((file, index) => ({
    id: `pending-file-${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    contentType: file.type || null,
    sizeBytes: file.size,
    downloadUrl: "",
    pending: true,
  }));
}

export function messageMatchesPending(
  message: MessageResponse,
  pendingMessage: LocalMessage
) {
  const sameContent =
    (message.content ?? "") === (pendingMessage.content ?? "");
  const sameSender = message.senderId === pendingMessage.senderId;
  const closeCreatedAt =
    Math.abs(
      new Date(message.createdAt).getTime() -
        new Date(pendingMessage.createdAt).getTime()
    ) < 10000;
  const pendingAttachments = getAttachmentSignature(pendingMessage.attachments);

  if (!sameContent || !sameSender || !closeCreatedAt) {
    return false;
  }

  return (
    !pendingAttachments ||
    pendingAttachments === getAttachmentSignature(message.attachments)
  );
}

export function groupMessagesByDay(messages: LocalMessage[]) {
  const groups: Array<{
    dateKey: string;
    label: string;
    items: LocalMessage[];
  }> = [];

  messages.forEach((message) => {
    const dateKey = message.createdAt?.slice(0, 10) || "unknown";
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup.dateKey !== dateKey) {
      groups.push({
        dateKey,
        label: formatDateSeparator(message.createdAt),
        items: [message],
      });

      return;
    }

    lastGroup.items.push(message);
  });

  return groups;
}
