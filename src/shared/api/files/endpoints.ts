export const fileEndpoints = {
  delete: (id: string) => `/files/${id}`,
  downloadUrl: (id: string) => `/files/${id}/download-url`,
  findMine: "/files",
  share: (id: string) => `/files/${id}/share`,
  upload: "/files",
};
