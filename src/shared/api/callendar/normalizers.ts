import type { CalendarEvent, CalendarEventResponse } from "./types";

export const DEFAULT_EVENT_COLOR = "#039BE5";

export const EVENT_COLORS = [
  "#AD1457",
  "#D81B60",
  "#D50000",
  "#E67C73",
  "#F4511E",
  "#EF6C00",
  "#F09300",
  "#F6BF26",
  "#E4C441",
  "#C0CA33",
  "#7CB342",
  "#33B679",
  "#0B8043",
  "#009688",
  "#039BE5",
  "#4285F4",
  "#3F51B5",
  "#7986CB",
  "#B39DDB",
  "#9E69AF",
  "#8E24AA",
  "#795548",
  "#616161",
  "#A79B8E",
] as const;

const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

function getFallbackColor(type: string) {
  if (type === "MEETING") return "#22C55E";
  return DEFAULT_EVENT_COLOR;
}

function expandShortHex(value: string) {
  if (value.length !== 4) return value.toUpperCase();

  return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase();
}

export function resolveEventColor(
  value: string | null | undefined,
  type: string = "EVENT",
) {
  if (typeof value !== "string") {
    return getFallbackColor(type);
  }

  const trimmed = value.trim();
  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return getFallbackColor(type);
  }

  return expandShortHex(trimmed);
}

export function eventColorSoftBackground(color: string, alpha = 0.16) {
  const hex = resolveEventColor(color);
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function normalizeCalendarEvent(
  event: CalendarEventResponse
): CalendarEvent {
  const startsAt = new Date(event.startsAt);
  const endsAt = new Date(event.endsAt);
  const type = event.type ?? "EVENT";

  return {
    id: event.id,
    title: event.title,
    description: event.description ?? "",
    startsAt,
    endsAt,
    allDay: Boolean(event.allDay),
    timeZone: event.timeZone ?? null,
    location: event.location ?? "",
    color: resolveEventColor(event.color, type),
    showAs: event.showAs ?? "BUSY",
    visibility: event.visibility ?? "DEFAULT",
    status: event.status ?? "CONFIRMED",
    guestCanModify: Boolean(event.guestCanModify),
    guestCanInvite: event.guestCanInvite ?? true,
    guestCanSeeGuests: event.guestCanSeeGuests ?? true,
    teamId: event.teamId ?? null,
    meetingId: event.meetingId ?? null,
    ownerId: event.ownerId ?? null,
    participants: (event.participants ?? []).map((participant) => ({
      ...participant,
      status: participant.status ?? "INVITED",
    })),
    reminders: event.reminders ?? [],
    createdAt: event.createdAt ? new Date(event.createdAt) : null,
    updatedAt: event.updatedAt ? new Date(event.updatedAt) : null,
    type,
    start: startsAt,
    end: endsAt,
  };
}

export function normalizeCalendarEvents(
  events: CalendarEventResponse[]
): CalendarEvent[] {
  return (events ?? []).map(normalizeCalendarEvent);
}
