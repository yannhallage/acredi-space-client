import type {
  DashboardMeeting,
  DashboardNotification,
  DashboardStats,
  DashboardWidgetConfig,
  DashboardWidgetType,
} from "../../shared/api/dashboard";
import type { CalendarEvent } from "../../shared/api/callendar";
import type { WorkspaceFile } from "../../shared/api/files/types";
import type { Note } from "../../shared/api/notes/type";
import type { User } from "../../shared/types";
import type { Team, TeamMember } from "../teams/types";
import type { IconName } from "../../shared/ui";
import { PERMISSIONS, type PermissionCode } from "../../shared/permissions";

export type DashboardDataContext = {
  calendarEvents: CalendarEvent[];
  files: WorkspaceFile[];
  isCalendarLoading: boolean;
  isFilesLoading: boolean;
  isMeetingsLoading: boolean;
  isNotesLoading: boolean;
  isNotificationsLoading: boolean;
  isStatsLoading: boolean;
  isTeamMembersLoading: boolean;
  isTeamsLoading: boolean;
  isUsersLoading: boolean;
  meetings: DashboardMeeting[];
  myTeams: Team[];
  notes: Note[];
  notifications: DashboardNotification[];
  stats: DashboardStats | null;
  teamMembers: TeamMember[];
  teams: Team[];
  users: User[];
};

export type WidgetComponentProps = {
  context: DashboardDataContext;
};

export const WIDGET_ICON: Record<DashboardWidgetType, IconName> = {
  AUDIT_LOG: "shield",
  FILES: "file",
  GLOBAL_STATS: "grid",
  MEETINGS: "video",
  MY_CALENDAR: "calendar",
  MY_FILES: "file",
  MY_MEETINGS: "video",
  MY_NOTES: "notes",
  MY_NOTIFICATIONS: "bell",
  MY_TEAM: "users",
  NOTES: "notes",
  NOTIFICATIONS: "bell",
  ONLINE_COLLEAGUES: "users",
  ONLINE_TEAM_MEMBERS: "users",
  ONLINE_USERS: "users",
  TEAM_ACTIVITY: "grid",
  TEAM_FILES: "file",
  TEAM_MEETINGS: "video",
  TEAM_NOTES: "notes",
  TEAMS: "building",
  USERS: "user",
};

export const WIDGET_REQUIREMENTS: Partial<Record<DashboardWidgetType, PermissionCode[]>> = {
  AUDIT_LOG: [PERMISSIONS.VIEW_AUDIT_LOGS],
  FILES: [PERMISSIONS.VIEW_ALL_FILES],
  MEETINGS: [PERMISSIONS.VIEW_MEETINGS],
  MY_CALENDAR: [PERMISSIONS.VIEW_CALENDAR],
  MY_FILES: [PERMISSIONS.VIEW_OWN_FILES],
  MY_MEETINGS: [PERMISSIONS.VIEW_MEETINGS],
  MY_NOTES: [PERMISSIONS.VIEW_NOTES],
  MY_NOTIFICATIONS: [PERMISSIONS.VIEW_NOTIFICATIONS],
  MY_TEAM: [PERMISSIONS.VIEW_MY_TEAMS, PERMISSIONS.MANAGE_TEAM],
  NOTES: [PERMISSIONS.VIEW_NOTES],
  NOTIFICATIONS: [PERMISSIONS.VIEW_NOTIFICATIONS],
  ONLINE_COLLEAGUES: [PERMISSIONS.CHAT_WITH_COLLABORATORS, PERMISSIONS.VIEW_MY_TEAMS],
  ONLINE_TEAM_MEMBERS: [PERMISSIONS.VIEW_MY_TEAMS, PERMISSIONS.MANAGE_TEAM],
  ONLINE_USERS: [PERMISSIONS.VIEW_ALL_USERS],
  TEAM_ACTIVITY: [PERMISSIONS.VIEW_MY_TEAMS, PERMISSIONS.MANAGE_TEAM],
  TEAM_FILES: [PERMISSIONS.ACCESS_TEAM_FILES],
  TEAM_MEETINGS: [PERMISSIONS.VIEW_MEETINGS],
  TEAM_NOTES: [PERMISSIONS.VIEW_NOTES],
  TEAMS: [PERMISSIONS.VIEW_TEAMS],
  USERS: [PERMISSIONS.VIEW_ALL_USERS],
};

export const WIDE_WIDGETS = new Set<DashboardWidgetType>([
  "GLOBAL_STATS",
  "MEETINGS",
  "MY_CALENDAR",
  "MY_MEETINGS",
  "TEAM_ACTIVITY",
  "TEAM_MEETINGS",
  "USERS",
]);

export const SKELETON_CARDS = ["card-a", "card-b", "card-c", "card-d", "card-e", "card-f"];
export const SKELETON_ROWS = ["row-a", "row-b", "row-c", "row-d", "row-e"];

export function orderWidgets(widgets: DashboardWidgetConfig[]) {
  return [...widgets].sort((a, b) => a.position - b.position);
}

export function widgetHasPermission(
  type: DashboardWidgetType,
  hasAnyPermission: (items: readonly PermissionCode[]) => boolean,
) {
  const requirements = WIDGET_REQUIREMENTS[type];
  return !requirements || hasAnyPermission(requirements);
}
