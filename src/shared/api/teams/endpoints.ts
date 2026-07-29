export const teamEndpoints = {
  findAll: "/teams",
  create: "/teams",
  update: (id: string) => `/teams/${id}`,
  delete: (id: string) => `/teams/${id}`,
  addMember: (id: string) => `/teams/${id}/members`,
  removeMember: (id: string, userId: string) => `/teams/${id}/members/${userId}`,
  findByUser: (userId: string) => `/users/${userId}/teams`,
} as const;
