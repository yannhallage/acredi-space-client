import { http } from "../http";
import { dashboardEndpoints } from "./endpoints";
import type {
  ApiResponse,
  DashboardMeeting,
  DashboardNotification,
  DashboardRole,
  DashboardStats,
  DashboardWidgetConfig,
  DashboardWidgetPermissionsResponse,
  DashboardWidgetsResponse,
  MeetingResponse,
  NotificationResponse,
  UpdateDashboardWidgetRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

function readDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function clampLayout(widget: DashboardWidgetConfig): DashboardWidgetConfig {
  return {
    ...widget,
    height: Math.min(3, Math.max(1, widget.height || 1)),
    position: Math.max(0, widget.position || 0),
    visible: Boolean(widget.visible),
    width: Math.min(4, Math.max(1, widget.width || 1)),
  };
}

function isDashboardWidgetsResponse(
  data: DashboardWidgetsResponse | DashboardWidgetPermissionsResponse
): data is DashboardWidgetsResponse {
  return Array.isArray((data as DashboardWidgetsResponse).widgets);
}

function normalizeWidgetPermissions(
  data: DashboardWidgetsResponse | DashboardWidgetPermissionsResponse
): DashboardWidgetsResponse {
  if (isDashboardWidgetsResponse(data)) {
    return {
      ...data,
      widgets: data.widgets.map(clampLayout),
    };
  }

  return {
    role: data.role,
    widgets: data.permissions.map((permission, position) =>
      clampLayout({
        height: 1,
        label: permission.label,
        position,
        type: permission.type,
        visible: true,
        width: 1,
      })
    ),
  };
}

function normalizeMeeting(meeting: MeetingResponse): DashboardMeeting {
  return {
    id: meeting.id,
    title: meeting.title,
    description: meeting.description ?? null,
    startsAt: readDate(meeting.startsAt),
    endsAt: readDate(meeting.endsAt),
    status: meeting.status ?? "SCHEDULED",
    roomName: meeting.roomName ?? "",
    joinUrl: meeting.joinUrl ?? null,
    organizerId: meeting.organizerId ?? null,
    teamId: meeting.teamId ?? null,
  };
}

// export function normalizeNotification(
//   notification: NotificationResponse
// ): DashboardNotification {
//   return {
//     id: notification.id,
//     type: notification.type ?? "SYSTEM",
//     title: notification.title ?? "Notification",
//     message: notification.message ?? "",
//     linkUrl: notification.linkUrl ?? null,
//     readAt: readDate(notification.readAt),
//     createdAt: readDate(notification.createdAt),
//   };
// }

function normalizeNotificationLinkUrl(notification: NotificationResponse) {
  const rawLink = notification.linkUrl?.trim();

  if (!rawLink) {
    return null;
  }

  const title = notification.title?.toLowerCase() ?? "";

  // Ancien mauvais lien DM ou chat :
  // /app/chat/channels/:id
  if (rawLink.startsWith("/app/chat/channels/")) {
    const channelId = rawLink.replace("/app/chat/channels/", "");

    // Cas message direct : "Nouveau message de Yann"
    if (title.startsWith("nouveau message de")) {
      return `/app/dm/${channelId}`;
    }

    // Cas canal/groupe
    return `/app/chat/${channelId}`;
  }

  // Ancien mauvais lien discussion groupe :
  // /app/teams/:teamId/discussions/:discussionId
  if (rawLink.includes("/discussions/")) {
    const discussionId = rawLink.split("/discussions/")[1];

    if (discussionId) {
      return `/app/chat/${discussionId}`;
    }
  }

  // Ancien mauvais lien réunion
  if (rawLink === "/app/meeting") {
    return "/app/meeting/meet-daily";
  }

  return rawLink;
}

export function normalizeNotification(
  notification: NotificationResponse
): DashboardNotification {
  return {
    id: notification.id,
    type: notification.type ?? "SYSTEM",
    title: notification.title ?? "Notification",
    message: notification.message ?? "",
    linkUrl: normalizeNotificationLinkUrl(notification),
    readAt: readDate(notification.readAt),
    createdAt: readDate(notification.createdAt),
  };
}

export const dashboardService = {
  async widgets() {
    const response = await http.get<
      ApiResponse<DashboardWidgetsResponse | DashboardWidgetPermissionsResponse>
    >(
      dashboardEndpoints.widgets
    );

    return normalizeWidgetPermissions(unwrapApiResponse(response));
  },

  async updateWidgets(widgets: UpdateDashboardWidgetRequest[]) {
    const response = await http.put<ApiResponse<DashboardWidgetsResponse>>(
      dashboardEndpoints.widgets,
      widgets.map(clampLayout)
    );
    const data = unwrapApiResponse(response);

    return {
      ...data,
      widgets: data.widgets.map(clampLayout),
    };
  },

  async stats(role: DashboardRole) {
    const response = await http.get<ApiResponse<DashboardStats>>(
      dashboardEndpoints.stats(role)
    );

    return unwrapApiResponse(response);
  },

  async meetings() {
    const response = await http.get<ApiResponse<MeetingResponse[]>>(
      dashboardEndpoints.meetings
    );

    return unwrapApiResponse(response).map(normalizeMeeting);
  },

  async notifications() {
    const response = await http.get<ApiResponse<NotificationResponse[]>>(
      dashboardEndpoints.notifications
    );

    return unwrapApiResponse(response).map(normalizeNotification);
  },

  async unreadNotificationCount() {
    const response = await http.get<ApiResponse<number>>(
      dashboardEndpoints.unreadNotificationCount
    );

    return unwrapApiResponse(response);
  },

  async markNotificationRead(id: string) {
    const response = await http.patch<ApiResponse<NotificationResponse>>(
      dashboardEndpoints.markNotificationRead(id)
    );

    return normalizeNotification(unwrapApiResponse(response));
  },

  async markAllNotificationsRead() {
    const response = await http.patch<ApiResponse<number>>(
      dashboardEndpoints.markAllNotificationsRead
    );

    return unwrapApiResponse(response);
  },

  async deleteNotification(id: string) {
    await http.delete<ApiResponse<void>>(dashboardEndpoints.deleteNotification(id));
  },
};
