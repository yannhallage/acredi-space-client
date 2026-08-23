import { useCallback, useEffect, useState } from "react";
import { billingService } from "./service";
import type {
  BillingAccessResponse,
  CreateSubscriptionRequest,
  InvoiceResponse,
  PlanResponse,
  SubscriptionResponse,
} from "./types";

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error("Une erreur inconnue est survenue.");
}

export function useBillingPlansQuery(enabled = true) {
  const [data, setData] = useState<PlanResponse[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const plans = await billingService.findPlans();
      setData(plans);
      setLoading(false);
      return plans;
    } catch (err) {
      const normalized = toError(err);
      setError(normalized);
      setLoading(false);
      throw normalized;
    }
  }, [enabled]);

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setData([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    billingService
      .findPlans()
      .then((plans) => {
        if (active) {
          setData(plans);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(toError(err));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { data, error, loading, refetch };
}

export function useCurrentSubscriptionQuery(enabled = true) {
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const subscription = await billingService.findCurrentSubscription();
      setData(subscription);
      setLoading(false);
      return subscription;
    } catch (err) {
      const normalized = toError(err);
      setError(normalized);
      setLoading(false);
      throw normalized;
    }
  }, [enabled]);

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setData(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    billingService
      .findCurrentSubscription()
      .then((subscription) => {
        if (active) {
          setData(subscription);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(toError(err));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { data, error, loading, refetch };
}

export function useBillingInvoicesQuery(enabled = true) {
  const [data, setData] = useState<InvoiceResponse[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const invoices = await billingService.findInvoices();
      setData(invoices);
      setLoading(false);
      return invoices;
    } catch (err) {
      const normalized = toError(err);
      setError(normalized);
      setLoading(false);
      throw normalized;
    }
  }, [enabled]);

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setData([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    billingService
      .findInvoices()
      .then((invoices) => {
        if (active) {
          setData(invoices);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(toError(err));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { data, error, loading, refetch };
}

export function useBillingAccessQuery(enabled = true) {
  const [data, setData] = useState<BillingAccessResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const access = await billingService.findAccess();
      setData(access);
      setLoading(false);
      return access;
    } catch (err) {
      const normalized = toError(err);
      setError(normalized);
      setLoading(false);
      throw normalized;
    }
  }, [enabled]);

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setData(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    billingService
      .findAccess()
      .then((access) => {
        if (active) {
          setData(access);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(toError(err));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { data, error, loading, refetch };
}

export function useCreateSubscriptionMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (request: CreateSubscriptionRequest) => {
    setIsPending(true);
    try {
      return await billingService.createSubscription(request);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutateAsync, isPending };
}
