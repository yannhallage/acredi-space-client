import type { ReactNode } from "react";
import type { DashboardWidgetType } from "../../../../shared/api/dashboard";
import type { WidgetComponentProps } from "../../constants";

import { AuditLogWidget } from "./AuditLogWidget";
import { FilesWidget, MyFilesWidget, TeamFilesWidget } from "./FilesWidget";
import { GlobalStatsWidget } from "./GlobalStatsWidget";
import { MeetingsWidget, MyMeetingsWidget, TeamMeetingsWidget } from "./MeetingsWidget";
import { MyCalendarWidget } from "./MyCalendarWidget";
import { MyNotesWidget, NotesWidget, TeamNotesWidget } from "./NotesWidget";
import { MyNotificationsWidget, NotificationsWidget } from "./NotificationsWidget";
import { MyTeamWidget, TeamsWidget } from "./TeamsWidget";
import {
  OnlineColleaguesWidget,
  OnlineTeamMembersWidget,
  TeamActivityWidget,
} from "./TeamWidgets";
import { OnlineUsersWidget, UsersWidget } from "./UsersWidget";

export const WIDGET_COMPONENTS: Record<
  DashboardWidgetType,
  (props: WidgetComponentProps) => ReactNode
> = {
  AUDIT_LOG: AuditLogWidget,
  FILES: FilesWidget,
  GLOBAL_STATS: GlobalStatsWidget,
  MEETINGS: MeetingsWidget,
  MY_CALENDAR: MyCalendarWidget,
  MY_FILES: MyFilesWidget,
  MY_MEETINGS: MyMeetingsWidget,
  MY_NOTES: MyNotesWidget,
  MY_NOTIFICATIONS: MyNotificationsWidget,
  MY_TEAM: MyTeamWidget,
  NOTES: NotesWidget,
  NOTIFICATIONS: NotificationsWidget,
  ONLINE_COLLEAGUES: OnlineColleaguesWidget,
  ONLINE_TEAM_MEMBERS: OnlineTeamMembersWidget,
  ONLINE_USERS: OnlineUsersWidget,
  TEAM_ACTIVITY: TeamActivityWidget,
  TEAM_FILES: TeamFilesWidget,
  TEAM_MEETINGS: TeamMeetingsWidget,
  TEAM_NOTES: TeamNotesWidget,
  TEAMS: TeamsWidget,
  USERS: UsersWidget,
};
