import type { Note as ApiNote } from "../../shared/api/notes";

export type SortMode = "newest" | "oldest";

export type NoteCardModel = {
  id: string;
  title: string;
  content: string;
  ownerName: string;
  updatedLabel: string;
  updatedMinutes: number;
  formattedDate: string;
  color: string | null;
  displayColor: string;
};

export const noteSkeletonKeys = [
  "note-skeleton-1",
  "note-skeleton-2",
  "note-skeleton-3",
  "note-skeleton-4",
];

export const editorTools = [
  "H1",
  "T",
  "B",
  "I",
  "List",
  "1.",
  "Check",
  "Left",
  "Center",
  "Right",
  "A",
  "Img",
  "Link",
  "Quote",
  "<>",
];

export const noteColors = [
  "#e8e8e8",
  "#fce4ec",
  "#ffe0b2",
  "#bbdefb",
  "#c8e6c9",
  "#fff9c4",
];

export function formatNoteDate(dateValue?: Date | string | null) {
  if (!dateValue) return "";

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function hashString(value: string) {
  return [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function isLightColor(background: string) {
  if (!/^#[0-9a-f]{6}$/i.test(background)) return true;

  const hex = background.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export function getDisplayColor(color: string | null, id: string) {
  if (color && isLightColor(color)) return color;

  return noteColors[hashString(id) % noteColors.length];
}

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getOwnerDisplayName(note: ApiNote) {
  const ownerName = note.ownerName?.trim();

  if (ownerName) return ownerName;

  const ownerId = note.ownerId?.trim();

  if (!ownerId || isUuidLike(ownerId) || ownerId.length > 28) {
    return "Auteur";
  }

  return ownerId;
}

function computeUpdatedMeta(dateValue?: Date | string | null) {
  if (!dateValue) return { label: "unknown", minutes: 0 };

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const time = date.getTime();

  if (Number.isNaN(time)) {
    return { label: "unknown", minutes: 0 };
  }

  const diff = Math.max(0, Math.floor((Date.now() - time) / 60000));

  if (diff < 1) return { label: "just now", minutes: 0 };
  if (diff < 60) return { label: `${diff} minutes ago`, minutes: diff };
  if (diff < 60 * 24) {
    return { label: `${Math.floor(diff / 60)} hours ago`, minutes: diff };
  }

  return {
    label: `${Math.floor(diff / (60 * 24))} days ago`,
    minutes: diff,
  };
}

export function getTextColor(background: string | null | undefined) {
  if (!background || !/^#[0-9a-f]{6}$/i.test(background)) {
    return "var(--text)";
  }

  const hex = background.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 150 ? "#111" : "#fff";
}

export function getMutedTextColor(textColor: string) {
  if (textColor === "#111") return "rgba(17, 17, 17, 0.68)";
  if (textColor === "#fff") return "rgba(255, 255, 255, 0.85)";

  return "var(--muted-soft)";
}

export function mapApiNoteToCard(note: ApiNote): NoteCardModel {
  const updatedAt = note.updatedAt ?? note.createdAt;
  const meta = computeUpdatedMeta(updatedAt);

  return {
    id: note.id,
    title: note.title,
    content: note.content,
    ownerName: getOwnerDisplayName(note),
    updatedLabel: meta.label,
    updatedMinutes: meta.minutes,
    formattedDate: formatNoteDate(updatedAt),
    color: note.color ?? null,
    displayColor: getDisplayColor(note.color ?? null, note.id),
  };
}
