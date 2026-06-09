import { useQuery } from "@tanstack/react-query";
import { meetingService } from "./service";
import type { MeetingResponse } from "./types";

export const meetingKeys = {
  all: ["meetings"] as const,
  mine: () => [...meetingKeys.all, "mine"] as const,
};

export function useMeetingsQuery(enabled = true) {
  return useQuery<MeetingResponse[]>({
    queryKey: meetingKeys.mine(),
    queryFn: () => meetingService.findMine(),
    enabled,
    staleTime: 1000 * 60,
  });
}