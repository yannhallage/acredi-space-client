export type MeetingStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";

export type MeetingResponse = {
  id: string;
  title: string;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: MeetingStatus;
  roomName?: string | null;
  joinUrl?: string | null;
  organizerId?: string | null;
  teamId?: string | null;
};

export type CreateMeetingRequest = {
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  teamId?: string | null;
};

export type UpdateMeetingRequest = {
  title?: string;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  teamId?: string | null;
};

export type InviteParticipantRequest = {
  userId: string;
};
