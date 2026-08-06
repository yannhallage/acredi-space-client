export type MailCategory = "primary" | "promotions" | "social";

export type MailFolderId =
  | "inbox"
  | "starred"
  | "snoozed"
  | "sent"
  | "drafts"
  | "purchases"
  | "more"
  | "contabo";

export interface MailHoverAction {
  kind: "pill" | "icon";
  id: string;
  label: string;
}

export interface MailMessage {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
  starred: boolean;
  important: boolean;
  category: MailCategory;
  folder: MailFolderId;
  hoverPills?: string[];
}

export interface MailFolder {
  id: MailFolderId;
  label: string;
  count?: number;
  icon: MailNavIcon;
}

export type MailNavIcon =
  | "inbox"
  | "star"
  | "snooze"
  | "sent"
  | "drafts"
  | "purchases"
  | "more"
  | "label";
