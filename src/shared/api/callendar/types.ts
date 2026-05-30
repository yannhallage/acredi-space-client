import type { ApiResponse } from "../api";

export type CalendarEventType = "EVENT" | "MEETING";

export type CalendarEventResponse = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string | null;
  ownerId: string | null;
 participants: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}[];
  createdAt: string | null;
  type: CalendarEventType;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  location: string;
  ownerId: string | null;
  participantIds: string[];
  createdAt: Date | null;
  type: CalendarEventType;
  color: string;
  start: Date;
  end: Date;
};

export type CreateCalendarEventRequest = {
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  participantIds?: string[];
};

export type UpdateCalendarEventRequest = {
  title?: string;
  startsAt?: string;
  endsAt?: string;
  location?: string | null;
  participantIds?: string[];
};

export type { ApiResponse };