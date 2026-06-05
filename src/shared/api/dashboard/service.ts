import { http } from "../http";
import { dashboardEndpoints } from "./endpoints";
import type {
  ApiResponse,
  DashboardMeeting,
  DashboardNotification,
  DashboardRole,
  DashboardStats,
  DashboardWidgetConfig,
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

function normalizeNotification(
  notification: NotificationResponse
): DashboardNotification {
  return {
    id: notification.id,
    type: notification.type ?? "SYSTEM",
    title: notification.title ?? "Notification",
    message: notification.message ?? "",
    readAt: readDate(notification.readAt),
    createdAt: readDate(notification.createdAt),
  };
}

export const dashboardService = {
  async widgets() {
    const response = await http.get<ApiResponse<DashboardWidgetsResponse>>(
      dashboardEndpoints.widgets
    );
    const data = unwrapApiResponse(response);

    return {
      ...data,
      widgets: data.widgets.map(clampLayout),
    };
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
};
