import type { GroupMessageResponse } from "../../../shared/api/discussions";

export type LocalGroupMessage = GroupMessageResponse & {
  pending?: boolean;
  failed?: boolean;
};

export interface ChatFileAttachment {
  id?: string | null;
  name: string;
  size?: number | null;
  contentType?: string | null;
}

const FILE_ATTACHMENT_REGEX =
  /[\r\n]*<!--ACREDISPACE_FILE:([\s\S]*?)-->/;

export function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateSeparator(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "CONVERSATION";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(date)
    .toUpperCase();
}

export function groupMessagesByDay(messages: LocalGroupMessage[]) {
  const groups: Array<{
    dateKey: string;
    label: string;
    items: LocalGroupMessage[];
  }> = [];

  messages.forEach((message) => {
    const dateKey = message.createdAt.slice(0, 10);
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

export function buildMessageContentWithFile(
  text: string,
  attachment: ChatFileAttachment,
) {
  const cleanText = text.trim();
  const encodedAttachment = encodeURIComponent(JSON.stringify(attachment));

  return `${cleanText}${cleanText ? "\n\n" : ""}<!--ACREDISPACE_FILE:${encodedAttachment}-->`;
}

export function parseMessageContent(content: string): {
  text: string;
  attachment: ChatFileAttachment | null;
} {
  const match = content.match(FILE_ATTACHMENT_REGEX);

  if (!match) {
    return {
      text: content,
      attachment: null,
    };
  }

  try {
    const attachment = JSON.parse(
      decodeURIComponent(match[1]),
    ) as ChatFileAttachment;

    return {
      text: content.replace(match[0], "").trim(),
      attachment,
    };
  } catch {
    return {
      text: content,
      attachment: null,
    };
  }
}
