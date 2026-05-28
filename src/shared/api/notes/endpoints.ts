export const notesEndpoints = {
  findMine: "/notes",
  findById: (id: string) => `/notes/${id}`,
  create: "/notes",
  update: (id: string) => `/notes/${id}`,
  delete: (id: string) => `/notes/${id}`,
} as const;
