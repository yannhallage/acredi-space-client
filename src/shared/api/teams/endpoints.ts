export const teamEndpoints = {
  findAll: "/teams",
  create: "/teams",
  update: (id: string) => `/teams/${id}`,
  delete: (id: string) => `/teams/${id}`,
  addMember: (id: string) => `/teams/${id}/members`,
} as const;
