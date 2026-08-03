export const fileEndpoints = {
  delete: (id: string) => `/files/${id}`,
  deletePermanently: (id: string) => `/files/${id}/permanent`,
  downloadUrl: (id: string) => `/files/${id}/download-url`,
  findMine: "/files",
  findSharedWithMe: "/files/shared",
  findTrash: "/files/trash",
  restore: (id: string) => `/files/${id}/restore`,
  share: (id: string) => `/files/${id}/share`,
  upload: "/files",
};
