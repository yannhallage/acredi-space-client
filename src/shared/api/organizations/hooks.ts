import { useCallback, useEffect, useState } from "react";
import { organizationService } from "./service";
import type { OrganizationResponse, UpdateOrganizationRequest } from "./types";

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error("Une erreur inconnue est survenue.");
}

export function useCurrentOrganizationQuery(enabled = true) {
  const [data, setData] = useState<OrganizationResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const organization = await organizationService.findCurrent();
      setData(organization);
      setLoading(false);
      return organization;
    } catch (err) {
      const normalized = toError(err);
      setError(normalized);
      setData(null);
      setLoading(false);
      throw normalized;
    }
  }, [enabled]);

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    organizationService
      .findCurrent()
      .then((organization) => {
        if (active) {
          setData(organization);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(toError(err));
          setData(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { data, error, loading, refetch };
}

export function useUpdateOrganizationMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (id: string, request: UpdateOrganizationRequest) => {
      setIsPending(true);
      setError(null);
      try {
        const data = await organizationService.update(id, request);
        setIsPending(false);
        return data;
      } catch (err) {
        const normalized = toError(err);
        setError(normalized);
        setIsPending(false);
        throw normalized;
      }
    },
    []
  );

  return { mutateAsync, isPending, error };
}

export function useUploadOrganizationLogoMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (id: string, file: File) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await organizationService.uploadLogo(id, file);
      setIsPending(false);
      return data;
    } catch (err) {
      const normalized = toError(err);
      setError(normalized);
      setIsPending(false);
      throw normalized;
    }
  }, []);

  return { mutateAsync, isPending, error };
}
