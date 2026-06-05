import type { ApiResponse } from "../api";

export type DashboardRole = "ADMIN" | "MANAGER" | "COLLABORATOR";

export type DashboardWidgetType =
  | "GLOBAL_STATS"
  | "USERS"
  | "ONLINE_USERS"
  | "TEAMS"
  | "FILES"
  | "NOTES"
  | "MEETINGS"
  | "AUDIT_LOG"
  | "NOTIFICATIONS"
  | "MY_TEAM"
  | "ONLINE_TEAM_MEMBERS"
  | "TEAM_FILES"
  | "TEAM_NOTES"
  | "TEAM_MEETINGS"
  | "TEAM_ACTIVITY"
  | "MY_MEETINGS"
  | "MY_FILES"
  | "MY_NOTES"
  | "MY_NOTIFICATIONS"
  | "MY_CALENDAR"
  | "ONLINE_COLLEAGUES";

export type DashboardWidgetConfig = {
  type: DashboardWidgetType;
  label: string;
  visible: boolean;
  position: number;
  width: number;
  height: number;
};

export type DashboardWidgetsResponse = {
  role: DashboardRole;
  widgets: DashboardWidgetConfig[];
};

export type UpdateDashboardWidgetRequest = DashboardWidgetConfig;

export type AdminDashboardStats = {
  users: number;
  teams: number;
  files: number;
  meetings: number;
};

export type ManagerDashboardStats = {
  teams: number;
  files: number;
  meetings: number;
};

export type CollaboratorDashboardStats = {
  files: number;
  meetings: number;
  unreadNotifications: number;
};

export type DashboardStats =
  | AdminDashboardStats
  | ManagerDashboardStats
  | CollaboratorDashboardStats;

export type MeetingStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";

export type DashboardMeeting = {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  status: MeetingStatus;
  roomName: string;
  joinUrl: string | null;
  organizerId: string | null;
  teamId: string | null;
};

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

export type DashboardNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: Date | null;
  createdAt: Date | null;
};

export type NotificationResponse = {
  id: string;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  readAt?: string | null;
  createdAt?: string | null;
};

export type { ApiResponse };
