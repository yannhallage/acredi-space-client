import { http } from "../http";
import { billingEndpoints } from "./endpoints";
import type {
  ApiResponse,
  BillingAccessResponse,
  CreateSubscriptionRequest,
  InvoiceResponse,
  PlanResponse,
  SubscriptionResponse,
} from "./types";

function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const billingService = {
  async findAccess(): Promise<BillingAccessResponse> {
    const response = await http.get<ApiResponse<BillingAccessResponse>>(
      billingEndpoints.access
    );
    return unwrapApiResponse(response);
  },

  async findPlans(): Promise<PlanResponse[]> {
    const response = await http.get<ApiResponse<PlanResponse[]>>(
      billingEndpoints.plans
    );
    return unwrapApiResponse(response) ?? [];
  },

  async findCurrentSubscription(): Promise<SubscriptionResponse | null> {
    try {
      const response = await http.get<ApiResponse<SubscriptionResponse>>(
        billingEndpoints.currentSubscription
      );
      return unwrapApiResponse(response);
    } catch {
      return null;
    }
  },

  async findInvoices(): Promise<InvoiceResponse[]> {
    const response = await http.get<ApiResponse<InvoiceResponse[]>>(
      billingEndpoints.invoices
    );
    return unwrapApiResponse(response) ?? [];
  },

  async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    const response = await http.post<ApiResponse<SubscriptionResponse>>(
      billingEndpoints.createSubscription,
      request
    );
    return unwrapApiResponse(response);
  },
};
