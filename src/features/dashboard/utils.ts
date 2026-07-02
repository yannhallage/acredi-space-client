import type { DashboardMeeting } from "../../shared/api/dashboard";
import type { CalendarEvent } from "../../shared/api/callendar";
import type { WorkspaceFile } from "../../shared/api/files/types";
import type { Note } from "../../shared/api/notes/type";
import type { DashboardStats } from "../../shared/api/dashboard";
import type { User } from "../../shared/types";
import { buildMeetingRoomUrl, extractMeetingRoomName } from "../../shared/api/meeting/room";

export function formatDateTime(date: Date | null) {
  if (!date) return "Date a confirmer";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

export function getMeetingTarget(meeting: DashboardMeeting) {
  const roomName = meeting.roomName || extractMeetingRoomName(meeting.joinUrl);

  if (roomName) {
    return buildMeetingRoomUrl(roomName);
  }

  return `/app/meeting/${meeting.id}`;
}

export function recentFiles(files: WorkspaceFile[]) {
  return [...files]
    .sort((a, b) => {
      const left = a.updatedAt ?? a.createdAt;
      const right = b.updatedAt ?? b.createdAt;
      return (right?.getTime() ?? 0) - (left?.getTime() ?? 0);
    })
    .slice(0, 5);
}

export function recentNotes(notes: Note[]) {
  return [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5);
}

export function upcomingMeetings(meetings: DashboardMeeting[]) {
  const now = Date.now();

  return meetings
    .filter(
      (meeting) =>
        meeting.status === "LIVE" ||
        (meeting.startsAt !== null && meeting.startsAt.getTime() >= now),
    )
    .sort((a, b) => (a.startsAt?.getTime() ?? 0) - (b.startsAt?.getTime() ?? 0))
    .slice(0, 5);
}

export function upcomingCalendarEvents(events: CalendarEvent[]) {
  const now = Date.now();

  return events
    .filter((event) => event.startsAt.getTime() >= now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 5);
}

export function onlineUsers(users: User[]) {
  return users.filter((user) => user.presence !== "offline");
}

export function kpiNumber(stats: DashboardStats | null, key: string, fallback = 0) {
  if (!stats || !(key in stats)) return fallback;

  const value = (stats as Record<string, number | undefined>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function ratioPercent(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function fileExtension(file: WorkspaceFile) {
  const extension = file.name.split(".").pop();
  return extension && extension !== file.name ? extension.slice(0, 4).toUpperCase() : "FILE";
}
