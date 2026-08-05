import { useCallback, useState } from "react";
import { authService } from "./service";
import type {
  ApiResponse,
  AuthResponse,
  CompleteOrganizationRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SignupStartRequest,
  VerifyOtpRequest,
} from "./types";

interface MutationState<TData> {
  data: TData | null;
  error: Error | null;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
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
    isSuccess: false,
    isError: false,
  });

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isPending: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables, options?: MutationOptions<TData>) => {
      setState({
        data: null,
        error: null,
        isPending: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const data = await mutationFn(variables);

        setState({
          data,
          error: null,
          isPending: false,
          isSuccess: true,
          isError: false,
        });

        options?.onSuccess?.(data);

        return data;
      } catch (error) {
        const normalizedError = toError(error);

        setState({
          data: null,
          error: normalizedError,
          isPending: false,
          isSuccess: false,
          isError: true,
        });

        options?.onError?.(normalizedError);

        throw normalizedError;
      }
    },
    [mutationFn]
  );

  const mutate = useCallback(
    (variables: TVariables, options?: MutationOptions<TData>) => {
      mutateAsync(variables, options).catch(() => {
        // L'erreur est déjà stockée dans le state.
      });
    },
    [mutateAsync]
  );

  return {
    ...state,
    loading: state.isPending,
    mutate,
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

export function useSignupStartMutation() {
  return useApiMutation<SignupStartRequest, ApiResponse<LoginResponse>>(
    authService.signupStart
  );
}

export function useSignupVerifyEmailMutation() {
  return useApiMutation<VerifyOtpRequest, ApiResponse<AuthResponse>>(
    authService.signupVerifyEmail
  );
}

export function useSignupCompleteOrganizationMutation() {
  return useApiMutation<CompleteOrganizationRequest, ApiResponse<AuthResponse>>(
    authService.signupCompleteOrganization
  );
}