import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
        },
    });
}

export function useDeleteCalendarEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => calendarService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
        },
    });
}
