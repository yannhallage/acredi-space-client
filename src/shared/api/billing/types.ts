export type BillingInterval = "MONTHLY" | "YEARLY";

export interface PlanResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number | string;
  billingInterval: BillingInterval;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionResponse {
  id: string;
  organizationId: string;
  planId: string;
  planName?: string | null;
  status: string;
  startedAt: string;
  currentPeriodEnd: string;
  canceledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceResponse {
  id: string;
  subscriptionId: string;
  organizationId: string;
  invoiceNumber: string;
  amountCents: number | string;
  currency: string;
  status: string;
  issuedAt: string;
  dueAt?: string;
  paidAt?: string | null;
  pdfUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
  status?: string;
  success?: boolean;
}

export interface CreateSubscriptionRequest {
  planId: string;
  status?: string;
  startedAt?: string;
  currentPeriodEnd?: string;
}
