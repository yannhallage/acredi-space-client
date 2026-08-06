import type { BillingInterval, InvoiceResponse, PlanResponse } from "./types";

export function toCentsNumber(value: number | string | null | undefined) {
  if (value == null) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMoneyFromCents(
  amountCents: number | string | null | undefined,
  currency = "EUR"
) {
  const amount = toCentsNumber(amountCents) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amount);
}

export function formatBillingInterval(interval?: BillingInterval | string | null) {
  if (interval === "YEARLY") {
    return "/ an";
  }
  return "/ mois";
}

export function formatBillingCycle(interval?: BillingInterval | string | null) {
  if (interval === "YEARLY") {
    return "Annuel";
  }
  return "Mensuel";
}

export function normalizeInvoiceStatus(status?: string | null) {
  const value = (status ?? "").toUpperCase();
  if (value === "PAID") {
    return "paid" as const;
  }
  if (value === "FAILED" || value === "CANCELED" || value === "CANCELLED") {
    return "failed" as const;
  }
  return "pending" as const;
}

export function normalizeSubscriptionStatus(status?: string | null) {
  const value = (status ?? "").toUpperCase();
  if (value === "TRIAL" || value === "TRIALING") {
    return "trial" as const;
  }
  if (value === "PAST_DUE" || value === "PAST-DUE") {
    return "past_due" as const;
  }
  return "active" as const;
}

export function planPriceLabel(plan: PlanResponse) {
  return formatMoneyFromCents(plan.priceCents);
}

export function invoiceAmountLabel(invoice: InvoiceResponse) {
  return formatMoneyFromCents(invoice.amountCents, invoice.currency);
}
