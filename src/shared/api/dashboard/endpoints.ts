import type { DashboardRole } from "./types";

export const dashboardEndpoints = {
  widgets: "/dashboard/widgets",
  stats: (role: DashboardRole) => {
    if (role === "ADMIN") return "/dashboard/admin";
    if (role === "MANAGER") return "/dashboard/manager";
    return "/dashboard/collaborator";
  },
  meetings: "/meetings",
  notifications: "/notifications",
  unreadNotificationCount: "/notifications/unread-count",
  markNotificationRead: (id: string) => `/notifications/${id}/read`,
  markAllNotificationsRead: "/notifications/read-all",
  deleteNotification: (id: string) => `/notifications/${id}`,
} as const;
