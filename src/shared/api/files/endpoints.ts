export const fileEndpoints = {
  delete: (id: string) => `/files/${id}`,
  downloadUrl: (id: string) => `/files/${id}/download-url`,
  findMine: "/files",
  findSharedWithMe: "/files/shared",
  share: (id: string) => `/files/${id}/share`,
  upload: "/files",
};