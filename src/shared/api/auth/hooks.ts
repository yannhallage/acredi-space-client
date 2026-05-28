import { useCallback, useState } from "react";
import { authService } from "./service";
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "./types";

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

function useApiMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    error: null,
    isPending: false,
  });

  const reset = useCallback(() => {
    setState({ data: null, error: null, isPending: false });
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables) => {
      setState({ data: null, error: null, isPending: true });

      try {
        const data = await mutationFn(variables);
        setState({ data, error: null, isPending: false });
        return data;
      } catch (error) {
        const normalizedError = toError(error);
        setState({ data: null, error: normalizedError, isPending: false });
        throw normalizedError;
      }
    },
    [mutationFn]
  );

  return {
    ...state,
    loading: state.isPending,
    mutate: mutateAsync,
    mutateAsync,
    reset,
  };
}

export function useForgotPasswordMutation() {
  return useApiMutation<ForgotPasswordRequest, ApiResponse<void>>(
    authService.forgotPassword
  );
}

export function useLoginMutation() {
  return useApiMutation<LoginRequest, ApiResponse<LoginResponse>>(
    authService.login
  );
}

export function useRefreshTokenMutation() {
  return useApiMutation<RefreshTokenRequest, ApiResponse<AuthResponse>>(
    authService.refresh
  );
}

export function useRegisterMutation() {
  return useApiMutation<RegisterRequest, ApiResponse<AuthResponse>>(
    authService.register
  );
}

export function useResetPasswordMutation() {
  return useApiMutation<ResetPasswordRequest, ApiResponse<void>>(
    authService.resetPassword
  );
}

export function useVerifyOtpMutation() {
  return useApiMutation<VerifyOtpRequest, ApiResponse<AuthResponse>>(
    authService.verifyOtp
  );
}
