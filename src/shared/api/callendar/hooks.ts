import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meetingKeys } from "../meeting/hooks";
import { calendarService } from "./service";

import type {
    CreateCalendarEventRequest,
    UpdateCalendarEventRequest,
} from "./types";

interface UseCalendarEventsOptions {
    enabled?: boolean;
}

export const calendarKeys = {
    all: ["calendar"] as const,
    events: () => [...calendarKeys.all, "events"] as const,
};

export function useCalendarEvents(options: UseCalendarEventsOptions = {}) {
    const { enabled = true } = options;

    return useQuery({
        queryKey: calendarKeys.events(),
        queryFn: () => calendarService.events(),
        enabled,
    });
}

export function useCreateCalendarEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateCalendarEventRequest) =>
            calendarService.create(request),
        onSuccess: (event) => {
            void queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
            if (event.meetingId || event.type === "MEETING") {
                void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
            }
        },
    });
}

export function useUpdateCalendarEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            request,
        }: {
            id: string;
            request: UpdateCalendarEventRequest;
        }) => calendarService.update(id, request),
        onSuccess: (event) => {
            void queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
            if (event.meetingId || event.type === "MEETING") {
                void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
            }
        },
    });
}

export function useDeleteCalendarEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => calendarService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
            void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
        },
    });
}
