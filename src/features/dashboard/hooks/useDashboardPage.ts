import { useMemo } from "react";

import {
  useDashboardMeetings,
  useDashboardNotifications,
  useDashboardStats,
  useDashboardWidgets,
} from "../../../shared/api/dashboard";
import { useCalendarEvents } from "../../../shared/api/callendar";
import { useFiles } from "../../../shared/api/files";
import { useNotes } from "../../../shared/api/notes";
import { useUsersQuery } from "../../../shared/api/users";
import { useAuth } from "../../../shared/context";
import { PERMISSIONS, usePermissions } from "../../../shared/permissions";
import { useMyTeams, useTeamMembers, useTeams } from "../../teams/hooks";

import {
  orderWidgets,
  widgetHasPermission,
  type DashboardDataContext,
} from "../constants";

export function useDashboardPage() {
  const { user } = useAuth();
  const { hasAnyPermission, hasPermission, loading: permissionsLoading } = usePermissions();
  const canViewDashboard = hasPermission(PERMISSIONS.VIEW_DASHBOARD);
  const canReadFiles = hasAnyPermission([
    PERMISSIONS.VIEW_OWN_FILES,
    PERMISSIONS.VIEW_ALL_FILES,
    PERMISSIONS.ACCESS_TEAM_FILES,
  ]);
  const canReadUsers = hasPermission(PERMISSIONS.VIEW_ALL_USERS);
  const canReadTeams = hasAnyPermission([PERMISSIONS.VIEW_TEAMS, PERMISSIONS.VIEW_MY_TEAMS, PERMISSIONS.MANAGE_TEAM]);
  const canReadAllTeams = hasPermission(PERMISSIONS.VIEW_TEAMS);
  const canReadNotes = hasPermission(PERMISSIONS.VIEW_NOTES);
  const canReadMeetings = hasPermission(PERMISSIONS.VIEW_MEETINGS);
  const canReadCalendar = hasPermission(PERMISSIONS.VIEW_CALENDAR);
  const canReadNotifications = hasPermission(PERMISSIONS.VIEW_NOTIFICATIONS);

  const widgetsQuery = useDashboardWidgets(!permissionsLoading && canViewDashboard);
  const widgetsResponse = widgetsQuery.data;
  const role = widgetsResponse?.role;
  const statsQuery = useDashboardStats(role, canViewDashboard);
  const filesQuery = useFiles({ enabled: canViewDashboard && canReadFiles });
  const notesQuery = useNotes({ archived: false }, { enabled: canViewDashboard && canReadNotes });
  const meetingsQuery = useDashboardMeetings(canViewDashboard && canReadMeetings);
  const notificationsQuery = useDashboardNotifications(canViewDashboard && canReadNotifications);
  const calendarQuery = useCalendarEvents({ enabled: canViewDashboard && canReadCalendar });
  const usersQuery = useUsersQuery({ enabled: canViewDashboard && canReadUsers });
  const teamsQuery = useTeams({ enabled: canViewDashboard && canReadAllTeams });
  const myTeamsQuery = useMyTeams({ enabled: canViewDashboard && canReadTeams });
  const firstTeamId = myTeamsQuery.data?.[0]?.id ?? "";
  const teamMembersQuery = useTeamMembers(firstTeamId);

  const permittedWidgets = useMemo(
    () =>
      orderWidgets(widgetsResponse?.widgets ?? []).filter((widget) =>
        widgetHasPermission(widget.type, hasAnyPermission),
      ),
    [hasAnyPermission, widgetsResponse?.widgets],
  );

  const context: DashboardDataContext = {
    calendarEvents: calendarQuery.data ?? [],
    files: filesQuery.data ?? [],
    isCalendarLoading: calendarQuery.isLoading,
    isFilesLoading: filesQuery.isLoading,
    isMeetingsLoading: meetingsQuery.isLoading,
    isNotesLoading: notesQuery.isLoading,
    isNotificationsLoading: notificationsQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    isTeamMembersLoading: teamMembersQuery.isLoading,
    isTeamsLoading: teamsQuery.isLoading || myTeamsQuery.isLoading,
    isUsersLoading: usersQuery.loading,
    meetings: meetingsQuery.data ?? [],
    myTeams: myTeamsQuery.data ?? [],
    notes: notesQuery.data ?? [],
    notifications: notificationsQuery.data ?? [],
    stats: statsQuery.data ?? null,
    teamMembers: teamMembersQuery.data ?? [],
    teams: teamsQuery.data ?? [],
    users: usersQuery.data ?? [],
  };

  return {
    canViewDashboard,
    context,
    permittedWidgets,
    permissionsLoading,
    role,
    user,
    widgetsQuery,
    widgetsResponse,
  };
}
