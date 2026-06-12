import { http } from "../http";
import { authEndpoints } from "./endpoints";
import { withTrustedDevice } from "./session";
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


export function unwrapApiResponse<TData>(response: ApiResponse<TData>) {
  return response.data;
}

export const authService = {
  forgotPassword(request: ForgotPasswordRequest) {
    return http.post<ApiResponse<void>>(authEndpoints.forgotPassword, request, {
      auth: false,
    });
  },

  login(request: LoginRequest) {
    return http.post<ApiResponse<LoginResponse>>(
      authEndpoints.login,
      withTrustedDevice(request),
      {
        auth: false,
      }
    );
  },

  refresh(request: RefreshTokenRequest) {
    return http.post<ApiResponse<AuthResponse>>(authEndpoints.refresh, request, {
      auth: false,
    });
  },

  register(request: RegisterRequest) {
    return http.post<ApiResponse<AuthResponse>>(authEndpoints.register, request, {
      auth: false,
    });
  },

  resetPassword(request: ResetPasswordRequest) {
    return http.post<ApiResponse<void>>(authEndpoints.resetPassword, request, {
      auth: false,
    });
  },

  verifyOtp(request: VerifyOtpRequest) {
    return http.post<ApiResponse<AuthResponse>>(authEndpoints.verifyOtp, request, {
      auth: false,
    });
  },
};
