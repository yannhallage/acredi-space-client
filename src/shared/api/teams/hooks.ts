import { useCallback, useEffect, useState } from "react";
import { teamService } from "./service";
import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  TeamResponse,
  UpdateTeamRequest,
} from "./types";

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

interface UseTeamsQueryOptions {
  enabled?: boolean;
}

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error("Une erreur inconnue est survenue.");
}

export function useTeamsQuery(options: UseTeamsQueryOptions = {}) {
  const { enabled = true } = options;
  const [state, setState] = useState<QueryState<TeamResponse[]>>({
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
      const data = await teamService.findAll();
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
    teamService
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

export function useCreateTeamMutation() {
  const [state, setState] = useState<MutationState<TeamResponse>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (request: CreateTeamRequest) => {
    setState({ data: null, error: null, isPending: true });

    try {
      const data = await teamService.create(request);
      setState({ data, error: null, isPending: false });
      return data;
    } catch (error) {
      const normalizedError = toError(error);
      setState({ data: null, error: normalizedError, isPending: false });
      throw normalizedError;
    }
  }, []);

  return { ...state, mutateAsync, reset };
}

export function useUpdateTeamMutation() {
  const [state, setState] = useState<MutationState<TeamResponse>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(
    async (id: string, request: UpdateTeamRequest) => {
      setState({ data: null, error: null, isPending: true });

      try {
        const data = await teamService.update(id, request);
        setState({ data, error: null, isPending: false });
        return data;
      } catch (error) {
        const normalizedError = toError(error);
        setState({ data: null, error: normalizedError, isPending: false });
        throw normalizedError;
      }
    },
    []
  );

  return { ...state, mutateAsync, reset };
}

export function useDeleteTeamMutation() {
  const [state, setState] = useState<MutationState<void>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (id: string) => {
    setState({ data: null, error: null, isPending: true });

    try {
      await teamService.delete(id);
      setState({ data: undefined, error: null, isPending: false });
    } catch (error) {
      const normalizedError = toError(error);
      setState({ data: null, error: normalizedError, isPending: false });
      throw normalizedError;
    }
  }, []);

  return { ...state, mutateAsync, reset };
}

export function useAddTeamMemberMutation() {
  const [state, setState] = useState<MutationState<TeamResponse>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(
    async (id: string, request: AddTeamMemberRequest) => {
      setState({ data: null, error: null, isPending: true });

      try {
        const data = await teamService.addMember(id, request);
        setState({ data, error: null, isPending: false });
        return data;
      } catch (error) {
        const normalizedError = toError(error);
        setState({ data: null, error: normalizedError, isPending: false });
        throw normalizedError;
      }
    },
    []
  );

  return { ...state, mutateAsync, reset };
}
