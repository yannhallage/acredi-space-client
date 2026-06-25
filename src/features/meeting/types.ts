export type ViewMode = "list" | "month" | "week" | "day";

export type MeetingMode = "Online" | "On-site";

export type Meeting = {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  description: string;
  mode: MeetingMode;
  color: string;
  roomName: string | null;
  joinUrl: string | null;
  organizerId: string | null;
  status: string | null;
  teamId: string | null;
};

export type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

export type MeetingAction = "start" | "end";

export type MeetingResponse = {
  id: string;
  title: string;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: string | null;
  roomName?: string | null;
  joinUrl?: string | null;
  organizerId?: string | null;
  teamId?: string | null;
};

export type MeetingFormState = {
  title: string;
  date: string;
  start: string;
  end: string;
  description: string;
  mode: MeetingMode;
};
