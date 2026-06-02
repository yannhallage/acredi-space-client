import { authService, normalizeAuthUser, unwrapApiResponse } from "./auth";
import type { AuthResponse, LoginResponse } from "./auth";
import type { User } from "../types";

export type ApiResponse<TData = unknown> = {
  data: TData;
  message?: string;
  status?: string;
  success?: boolean;
  timestamp?: string;
};

export const api = {
  async getCurrentUser(): Promise<User> {
    const storedUser = localStorage.getItem("acredi-user");

    if (!storedUser) {
      throw new Error("Session utilisateur introuvable");
    }

    return normalizeAuthUser(JSON.parse(storedUser));
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    return unwrapApiResponse(await authService.login({ email, password }));
  },

  async verifyOtp(challengeId: string, code: string): Promise<AuthResponse> {
    return unwrapApiResponse(
      await authService.verifyOtp({
        challengeId,
        code,
        otpId: challengeId,
      })
    );
  },
};

export * from "./auth";
export * from "./http";
