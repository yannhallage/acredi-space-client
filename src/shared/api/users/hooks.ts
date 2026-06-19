import { useCallback, useEffect, useState } from "react";
import type { User } from "../../types";
import { userService } from "./service";
import type {
  ChangePasswordRequest,
  InviteUserRequest,
  UpdateProfileRequest,
  UpdateUserRequest,
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

export function useUpdateUserMutation() {
  const [state, setState] = useState<MutationState<User>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(
    async (id: string, request: UpdateUserRequest) => {
      setState({ data: null, error: null, isPending: true });

      try {
        const data = await userService.update(id, request);
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

  return {
    ...state,
    loading: state.isPending,
    mutate: mutateAsync,
    mutateAsync,
    reset,
  };
}

export function useUpdateProfileMutation() {
  const [state, setState] = useState<MutationState<User>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (request: UpdateProfileRequest) => {
    setState({ data: null, error: null, isPending: true });

    try {
      const data = await userService.updateProfile(request);
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

export function useUploadAvatarMutation() {
  const [state, setState] = useState<MutationState<User>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (file: File) => {
    setState({ data: null, error: null, isPending: true });

    try {
      const data = await userService.uploadAvatar(file);
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

export function useChangeMyPasswordMutation() {
  const [state, setState] = useState<MutationState<User>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (request: ChangePasswordRequest) => {
    setState({ data: null, error: null, isPending: true });

    try {
      const data = await userService.changeMyPassword(request);
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


export function useActivateUserMutation() {
  const [state, setState] = useState<MutationState<User>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (userId: string) => {
    setState({ data: null, error: null, isPending: true });

    try {
      const data = await userService.activate(userId);
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

export function useDeactivateUserMutation() {
  const [state, setState] = useState<MutationState<User>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (userId: string) => {
    setState({ data: null, error: null, isPending: true });

    try {
      const data = await userService.deactivate(userId);
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

export function useDeleteUserMutation() {
  const [state, setState] = useState<MutationState<void>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(async (userId: string) => {
    setState({ data: null, error: null, isPending: true });

    try {
      await userService.delete(userId);
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