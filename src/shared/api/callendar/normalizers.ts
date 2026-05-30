import type { CalendarEvent, CalendarEventResponse } from "./types";

function getEventColor(type: string) {
  if (type === "MEETING") return "#22C55E";
  return "#5B6CFF";
}

export function normalizeCalendarEvent(
  event: CalendarEventResponse
): CalendarEvent {
  const startsAt = new Date(event.startsAt);
  const endsAt = new Date(event.endsAt);

  return {
    id: event.id,
    title: event.title,
    startsAt,
    endsAt,
    location: event.location ?? "",
    ownerId: event.ownerId ?? null,
   
    participants: event.participants ?? [],
    createdAt: event.createdAt ? new Date(event.createdAt) : null,
    type: event.type,
    color: getEventColor(event.type),
    start: startsAt,
    end: endsAt,
  };
}

export function normalizeCalendarEvents(
  events: CalendarEventResponse[]
): CalendarEvent[] {
  return events.map(normalizeCalendarEvent);
}