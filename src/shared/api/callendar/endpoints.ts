export const calendarEndpoints = {
  events: "/calendar/events",
  create: "/calendar/events",
  update: (id: string) => `/calendar/events/${id}`,
  delete: (id: string) => `/calendar/events/${id}`,
  participants: (id: string) => `/calendar/events/${id}/participants`,
} as const;