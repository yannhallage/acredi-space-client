export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  billingEmail?: string | null;
  timezone?: string;
  locale?: string;
  status?: string;
  planId?: string | null;
  ownerUserId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  siret?: string | null;
  vatNumber?: string | null;
  currency?: string;
  industry?: string | null;
  companySize?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  billingEmail?: string | null;
  timezone?: string;
  locale?: string;
  status?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  siret?: string | null;
  vatNumber?: string | null;
  currency?: string;
  industry?: string | null;
  companySize?: string | null;
  planId?: string | null;
}

export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
  status?: string;
  success?: boolean;
}
