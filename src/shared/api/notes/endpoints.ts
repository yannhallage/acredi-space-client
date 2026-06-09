export const noteEndpoints = {
  archive: (id: string) => `/notes/${id}/archive`,
  create: "/notes",
  delete: (id: string) => `/notes/${id}`,
  findAll: "/notes",
  findById: (id: string) => `/notes/${id}`,
  findVersions: (id: string) => `/notes/${id}/versions`,
  pin: (id: string) => `/notes/${id}/pin`,
  restore: (id: string) => `/notes/${id}/restore`,
  share: (id: string) => `/notes/${id}/share`,
  unpin: (id: string) => `/notes/${id}/unpin`,
  update: (id: string) => `/notes/${id}`,
} as const;