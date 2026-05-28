import { useCallback, useEffect, useState } from "react";
import type { User } from "../../types";
import { userService } from "./service";
import type { InviteUserRequest } from "./types";

interface QueryState<TData> {
  data: TData | null;
  error: Error | null;
  loading: boolean;
}

interface MutationState<TData> {
  data: TData | null;
  error: Error | null;
  isPending: boolean;
}

interface UseUsersQueryOptions {
  enabled?: boolean;
}

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error("Une erreur inconnue est survenue.");
}

export function useUsersQuery(options: UseUsersQueryOptions = {}) {
  const { enabled = true } = options;
  const [state, setState] = useState<QueryState<User[]>>({
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
      const data = await userService.findAll();
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
    userService
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

export function useInviteUserMutation() {
  const [state, setState] = useState<MutationState<User>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (request: InviteUserRequest) => {
    setState({ data: null, error: null, isPending: true });

    try {
      const data = await userService.invite(request);
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
