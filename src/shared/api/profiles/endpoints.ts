export const profileEndpoints = {
  create: "/profiles",
  delete: (id: string) => `/profiles/${id}`,
  findAll: "/profiles",
} as const;
