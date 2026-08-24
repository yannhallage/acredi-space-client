import { getFriendlyErrorMessage } from "../../shared/feedback";
import { extractMeetingRoomName } from "../../shared/api/meeting/room";
import type { User } from "../../shared/types";
import {
  getLocalDate,
  getLocalTime,
  toDateKey,
} from "../../shared/utils/calendarGrid";
import type {
  Meeting,
  MeetingAction,
  MeetingResponse,
  ViewMode,
} from "./types";

export const MEETING_COLORS = [
  "bg-[#9bdcf7]",
  "bg-[#b7addd]",
  "bg-[#55d6d1]",
  "bg-[#ffe477]",
  "bg-[#ffb09e]",
];

export const DROPDOWN_WIDTH = 220;

export function getMeetingActionKey(action: MeetingAction, meetingId: string) {
  return `${action}:${meetingId}`;
}

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getUserLabel(user: User) {
  const currentUser = user as User & {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };

  const fullName = [currentUser.firstName, currentUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    currentUser.name || fullName || currentUser.email || "Utilisateur sans nom"
  );
}

export function getErrorMessage(error: unknown) {
  return getFriendlyErrorMessage(error, "Une erreur est survenue.");
}

export function isPastMeeting(meeting: Meeting) {
  const meetingEnd = new Date(`${meeting.date}T${meeting.end}:00`).getTime();
  return meetingEnd < Date.now();
}

export function isPastDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).getTime() < Date.now();
}

export function mapMeetingResponse(
  meeting: MeetingResponse,
  index: number,
): Meeting {
  const startsAt = meeting.startsAt ? new Date(meeting.startsAt) : null;
  const endsAt = meeting.endsAt ? new Date(meeting.endsAt) : null;

  return {
    id: meeting.id,
    title: meeting.title || "Réunion sans titre",
    description: meeting.description ?? "",
    date: startsAt ? getLocalDate(startsAt) : toDateKey(new Date()),
    start: startsAt ? getLocalTime(startsAt) : "09:00",
    end: endsAt ? getLocalTime(endsAt) : "10:00",
    mode: meeting.joinUrl ? "Online" : "On-site",
    color: MEETING_COLORS[index % MEETING_COLORS.length],
    roomName: meeting.roomName ?? extractMeetingRoomName(meeting.joinUrl),
    joinUrl: meeting.joinUrl ?? null,
    organizerId: meeting.organizerId ?? null,
    status: meeting.status ?? null,
    teamId: meeting.teamId ?? null,
  };
}

export function formatMeetingTitle(date: Date, view: ViewMode) {
  if (view === "month") {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }

  return date.toLocaleDateString("fr-FR", {
    weekday: view === "day" ? "long" : undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
