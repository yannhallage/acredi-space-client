export type EmptyIllustration =
  | "calendar"
  | "file"
  | "meeting"
  | "note"
  | "notification"
  | "teams"
  | "user";

const EMPTY_ILLUSTRATIONS_DARK: Record<EmptyIllustration, string> = {
  calendar: "/custom/calendar-balck_.png",
  file: "/custom/file-black.png",
  meeting: "/custom/mett-balck.png",
  note: "/custom/note-black.png",
  notification: "/custom/notification-black.png",
  teams: "/custom/user-balck.png",
  user: "/custom/user-balck.png",
};

const EMPTY_ILLUSTRATIONS_LIGHT: Record<EmptyIllustration, string> = {
  calendar: "/not-found-white/calendar.png",
  file: "/not-found-white/file.png",
  meeting: "/not-found-white/chat.png",
  note: "/not-found-white/note.png",
  notification: "/not-found-white/chat.png",
  teams: "/not-found-white/teams.png",
  user: "/not-found-white/user.png",
};

export function getEmptyIllustration(illustration: EmptyIllustration, dark: boolean): string {
  const map = dark ? EMPTY_ILLUSTRATIONS_DARK : EMPTY_ILLUSTRATIONS_LIGHT;
  return map[illustration];
}
