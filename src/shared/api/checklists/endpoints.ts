export const checklistEndpoints = {
  findAll: "/checklists",
  create: "/checklists",
  findById: (id: string) => `/checklists/${id}`,
  update: (id: string) => `/checklists/${id}`,
  delete: (id: string) => `/checklists/${id}`,
  members: (id: string) => `/checklists/${id}/members`,
  member: (id: string, userId: string) => `/checklists/${id}/members/${userId}`,
  items: (id: string) => `/checklists/${id}/items`,
  item: (id: string, itemId: string) => `/checklists/${id}/items/${itemId}`,
  toggleItem: (id: string, itemId: string) =>
    `/checklists/${id}/items/${itemId}/toggle`,
  moveItem: (id: string, itemId: string) =>
    `/checklists/${id}/items/${itemId}/move`,
} as const;
