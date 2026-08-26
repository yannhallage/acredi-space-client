import { getFriendlyErrorMessage } from "../../shared/feedback";
import type { CalendarEvent } from "../../shared/api/callendar/types";
import {
  CALENDAR_HOUR_HEIGHT,
  getCalendarHeight,
  getCalendarTop,
  getLocalTime,
} from "../../shared/utils/calendarGrid";
import type { ViewMode } from "./types";

export const CALENDAR_VIEWS: Array<{ label: string; value: ViewMode }> = [
  { label: "Liste", value: "list" },
  { label: "Mois", value: "month" },
  { label: "Semaine", value: "week" },
  { label: "Jour", value: "day" },
];

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getErrorMessage(error: unknown) {
  return getFriendlyErrorMessage(error, "Une erreur est survenue.");
}

export function sortEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function getEventTypeLabel(event: CalendarEvent) {
  return event.type === "MEETING" ? "Reunion" : "Evenement";
}

/** Evenement stocke dans calendar_events (pas une projection Meeting orpheline). */
export function isManagedCalendarEvent(event: CalendarEvent) {
  if (event.type === "EVENT") return true;
  if (!event.meetingId) return true;
  return event.id !== event.meetingId;
}

export function canJoinMeetingFromEvent(event: CalendarEvent) {
  return Boolean(
    event.type === "MEETING" ||
      event.meetingId ||
      event.roomName ||
      event.joinUrl,
  );
}

export function getEventTop(event: CalendarEvent) {
  return getCalendarTop(getLocalTime(event.start));
}

export function getEventHeight(event: CalendarEvent) {
  return Math.max(
    34,
    ((event.end.getTime() - event.start.getTime()) / 3600000) *
      CALENDAR_HOUR_HEIGHT,
  );
}

export function getLoadingEventBlocks(view: ViewMode, dayIndex: number) {
  const blocks = [
    { start: "09:00", end: "10:00" },
    { start: "11:30", end: "12:30" },
    { start: "14:00", end: "15:30" },
  ];

  if (view === "day") {
    return blocks;
  }

  return blocks.filter((_, index) => (dayIndex + index) % 2 === 0);
}

export function getSkeletonTop(start: string) {
  return getCalendarTop(start);
}

export function getSkeletonHeight(start: string, end: string) {
  return getCalendarHeight(start, end);
}

export function getMonthSkeletonCount(day: Date) {
  return day.getDate() % 3 === 0 ? 2 : 1;
}
