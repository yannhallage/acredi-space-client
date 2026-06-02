import { useCallback, useEffect, useState } from "react";
import { profileService } from "./service";
import type { ProfileResponse } from "./types";

interface QueryState<TData> {
  data: TData | null;
  error: Error | null;
  loading: boolean;
}

interface UseProfilesQueryOptions {
  enabled?: boolean;
}

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error("Une erreur inconnue est survenue.");
}

export function useProfilesQuery(options: UseProfilesQueryOptions = {}) {
  const { enabled = true } = options;
  const [state, setState] = useState<QueryState<ProfileResponse[]>>({
    data: enabled ? null : [],
    error: null,
    loading: enabled,
  });

  const refetch = useCallback(async () => {
    if (!enabled) {
      setState({ data: [], error: null, loading: false });
      return [];
    }

    setState((current) => ({ ...current, error: null, loading: true }));

    try {
      const data = await profileService.findAll();
      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      const normalizedError = toError(error);
      setState({ data: null, error: normalizedError, loading: false });
      throw normalizedError;
    }
  }, [enabled]);

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setState({ data: [], error: null, loading: false });
      return () => {
        active = false;
      };
    }

    setState((current) => ({ ...current, error: null, loading: true }));
    profileService
      .findAll()
      .then((data) => {
        if (active) {
          setState({ data, error: null, loading: false });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ data: null, error: toError(error), loading: false });
        }
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return { ...state, refetch };
}
