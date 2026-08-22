export const pollEndpoints = {
  findAll: "/polls",
  create: "/polls",
  findById: (id: string) => `/polls/${id}`,
  update: (id: string) => `/polls/${id}`,
  delete: (id: string) => `/polls/${id}`,
  publish: (id: string) => `/polls/${id}/publish`,
  schedule: (id: string) => `/polls/${id}/schedule`,
  close: (id: string) => `/polls/${id}/close`,
  archive: (id: string) => `/polls/${id}/archive`,
  participants: (id: string) => `/polls/${id}/participants`,
  participant: (id: string, userId: string) =>
    `/polls/${id}/participants/${userId}`,
  responses: (id: string) => `/polls/${id}/responses`,
  myResponse: (id: string) => `/polls/${id}/responses/me`,
  results: (id: string) => `/polls/${id}/results`,
  stats: (id: string) => `/polls/${id}/stats`,
} as const;
