export const meetingEndpoints = {
  meetings: "/meetings",
  meeting: (id: string) => `/meetings/${id}`,
  participants: (id: string) => `/meetings/${id}/participants`,
  start: (id: string) => `/meetings/${id}/start`,
  end: (id: string) => `/meetings/${id}/end`,
} as const;
