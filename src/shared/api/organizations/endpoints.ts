export const organizationEndpoints = {
  findAll: "/organizations",
  findById: (id: string) => `/organizations/${id}`,
  update: (id: string) => `/organizations/${id}`,
};
