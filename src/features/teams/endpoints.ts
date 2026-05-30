export const teamEndpoints = {
  findAll: "/teams",
  create: "/teams",
  update: (id: string) => `/teams/${id}`,
  addMember: (id: string) => `/teams/${id}/members`,
  delete: (id: string) => `/teams/${id}`,
} as const;