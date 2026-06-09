import { http } from "../api";
import { calendarEndpoints } from "./endpoints";
import {
    normalizeCalendarEvent,
    normalizeCalendarEvents,
} from "./normalizers";

import type {
    ApiResponse,
    CalendarEventResponse,
    CreateCalendarEventRequest,
    UpdateCalendarEventRequest,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
    return response.data;
}

export const calendarService = {
    async events() {
        const response = await http.get<ApiResponse<CalendarEventResponse[]>>(
            calendarEndpoints.events
        );

        return normalizeCalendarEvents(unwrapApiResponse(response));
    },

    async create(request: CreateCalendarEventRequest) {
        const response = await http.post<ApiResponse<CalendarEventResponse>>(
            calendarEndpoints.create,
            request
        );

        return normalizeCalendarEvent(unwrapApiResponse(response));
    },

    async update(id: string, request: UpdateCalendarEventRequest) {
        const response = await http.put<ApiResponse<CalendarEventResponse>>(
            calendarEndpoints.update(id),
            request
        );

        return normalizeCalendarEvent(unwrapApiResponse(response));
    },

    async delete(id: string) {
        await http.delete<ApiResponse<void>>(calendarEndpoints.delete(id));
    },
};