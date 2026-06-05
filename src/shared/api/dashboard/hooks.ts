import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "./service";
import type { DashboardRole, UpdateDashboardWidgetRequest } from "./types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  widgets: () => [...dashboardKeys.all, "widgets"] as const,
  stats: (role: DashboardRole | null | undefined) =>
    [...dashboardKeys.all, "stats", role ?? "none"] as const,
  meetings: () => [...dashboardKeys.all, "meetings"] as const,
  notifications: () => [...dashboardKeys.all, "notifications"] as const,
};

export function useDashboardWidgets(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.widgets(),
    queryFn: () => dashboardService.widgets(),
    enabled,
  });
}

export function useUpdateDashboardWidgets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (widgets: UpdateDashboardWidgetRequest[]) =>
      dashboardService.updateWidgets(widgets),
    onSuccess: (data) => {
      queryClient.setQueryData(dashboardKeys.widgets(), data);
      queryClient.invalidateQueries({ queryKey: dashboardKeys.widgets() });
    },
  });
}

export function useDashboardStats(
  role: DashboardRole | null | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: dashboardKeys.stats(role),
    queryFn: () => dashboardService.stats(role!),
    enabled: Boolean(role) && enabled,
  });
}

export function useDashboardMeetings(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.meetings(),
    queryFn: () => dashboardService.meetings(),
    enabled,
  });
}

export function useDashboardNotifications(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.notifications(),
    queryFn: () => dashboardService.notifications(),
    enabled,
  });
}
