export const teamEndpoints = {
  findAll: "/teams",
  findMine: "/teams/my-team",
  create: "/teams",
  update: (id: string) => `/teams/${id}`,
  members: (id: string) => `/teams/${id}/members`,
  addMember: (id: string) => `/teams/${id}/members`,
  removeMember: (id: string, userId: string) => `/teams/${id}/members/${userId}`,
  delete: (id: string) => `/teams/${id}`,
} as const;
