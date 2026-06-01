export const teamEndpoints = {
  findAll: "/teams",
  create: "/teams",
  update: (id: string) => `/teams/${id}`,
  members: (id: string) => `/teams/${id}/members`,
  addMember: (id: string) => `/teams/${id}/members`,
  delete: (id: string) => `/teams/${id}`,
} as const;
