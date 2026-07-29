import { useCallback, useEffect, useState } from "react";
import { profileService } from "./service";
import type { CreateProfileRequest, ProfileResponse } from "./types";

interface QueryState<TData> {
  data: TData | null;
  error: Error | null;
  loading: boolean;
}

interface UseProfilesQueryOptions {
  enabled?: boolean;
}

interface MutationState<TData> {
  data: TData | null;
  error: Error | null;
  isPending: boolean;
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

export function useCreateProfileMutation() {
  const [state, setState] = useState<MutationState<ProfileResponse>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (request: CreateProfileRequest) => {
    setState({ data: null, error: null, isPending: true });

    try {
      const data = await profileService.create(request);
      setState({ data, error: null, isPending: false });
      return data;
    } catch (error) {
      const normalizedError = toError(error);
      setState({ data: null, error: normalizedError, isPending: false });
      throw normalizedError;
    }
  }, []);

  return {
    ...state,
    loading: state.isPending,
    mutate: mutateAsync,
    mutateAsync,
    reset,
  };
}

export function useDeleteProfileMutation() {
  const [state, setState] = useState<MutationState<void>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (profileId: string) => {
    setState({ data: null, error: null, isPending: true });

    try {
      await profileService.delete(profileId);
      setState({ data: undefined, error: null, isPending: false });
    } catch (error) {
      const normalizedError = toError(error);
      setState({ data: null, error: normalizedError, isPending: false });
      throw normalizedError;
    }
  }, []);

  return {
    ...state,
    loading: state.isPending,
    mutate: mutateAsync,
    mutateAsync,
    reset,
  };
}
