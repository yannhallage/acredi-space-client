export const folderEndpoints = {
  create: "/folders",
  delete: (id: string) => `/folders/${id}`,
  findMine: "/folders",
  update: (id: string) => `/folders/${id}`,
} as const;
