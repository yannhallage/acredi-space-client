import type { ApiResponse } from "../api";

export type CalendarEventType = "EVENT" | "MEETING";
export type EventShowAs = "BUSY" | "FREE";
export type EventVisibility = "DEFAULT" | "PUBLIC" | "PRIVATE";
export type EventStatus = "CONFIRMED" | "TENTATIVE" | "CANCELLED";
export type GuestStatus = "INVITED" | "ACCEPTED" | "DECLINED" | "TENTATIVE";
export type ReminderMethod = "NOTIFICATION" | "EMAIL";

export type CalendarReminder = {
  id?: string;
  method: ReminderMethod;
  minutesBefore: number;
  sentAt?: string | null;
};

export type CalendarEventResponse = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  timeZone: string | null;
  location: string | null;
  color: string | null;
  showAs: EventShowAs;
  visibility: EventVisibility;
  status: EventStatus;
  guestCanModify: boolean;
  guestCanInvite: boolean;
  guestCanSeeGuests: boolean;
  teamId: string | null;
  meetingId: string | null;
  ownerId: string | null;
  participants: CalendarParticipant[];
  reminders: CalendarReminder[];
  createdAt: string | null;
  updatedAt: string | null;
  type: CalendarEventType;
};

export type CalendarParticipant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: GuestStatus;
};

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  timeZone: string | null;
  location: string;
  color: string;
  showAs: EventShowAs;
  visibility: EventVisibility;
  status: EventStatus;
  guestCanModify: boolean;
  guestCanInvite: boolean;
  guestCanSeeGuests: boolean;
  teamId: string | null;
  meetingId: string | null;
  ownerId: string | null;
  participants: CalendarParticipant[];
  reminders: CalendarReminder[];
  createdAt: Date | null;
  updatedAt: Date | null;
  type: CalendarEventType;
  start: Date;
  end: Date;
};

export type CreateCalendarEventRequest = {
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  allDay?: boolean;
  timeZone?: string | null;
  location?: string | null;
  color?: string | null;
  showAs?: EventShowAs;
  visibility?: EventVisibility;
  status?: EventStatus;
  guestCanModify?: boolean;
  guestCanInvite?: boolean;
  guestCanSeeGuests?: boolean;
  teamId?: string | null;
  meetingId?: string | null;
  participantIds?: string[];
  reminders?: Array<{
    method: ReminderMethod;
    minutesBefore: number;
  }>;
};

export type UpdateCalendarEventRequest = {
  title?: string;
  description?: string | null;
  startsAt?: string;
  endsAt?: string;
  allDay?: boolean;
  timeZone?: string | null;
  location?: string | null;
  color?: string | null;
  showAs?: EventShowAs;
  visibility?: EventVisibility;
  status?: EventStatus;
  guestCanModify?: boolean;
  guestCanInvite?: boolean;
  guestCanSeeGuests?: boolean;
  teamId?: string | null;
  meetingId?: string | null;
  participantIds?: string[];
  reminders?: Array<{
    method: ReminderMethod;
    minutesBefore: number;
  }>;
};

export type { ApiResponse };
