import { userService } from "../users";

export const fileEndpoints = {
  findMine: "/files",
  upload: "/files",
  delete: (id: string) => `/files/${id}`,
  downloadUrl: (id: string) => `/files/${id}/download-url`,
  share: (id: string) => `/files/${id}/share`,
  shared: "/files/shared",
};