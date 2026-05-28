import { authService, normalizeAuthUser, unwrapApiResponse } from "./auth";
import type { AuthResponse, LoginResponse } from "./auth";
import type { User } from "../types";

export const api = {
  async getCurrentUser(): Promise<User> {
    const storedUser = localStorage.getItem("acredi-user");

    if (!storedUser) {
      throw new Error("Session utilisateur introuvable");
    }

    return normalizeAuthUser(JSON.parse(storedUser));
  },

<<<<<<< HEAD
  async verifyOtp(otpId: string, code: string) {

    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },
      
      body: JSON.stringify({
        otpId,
        code
      })
      

    });

    if (!response.ok) {
      throw new Error('Code OTP invalide');
    }
    console.log("VERIFY OTP RESPONSE:", response);
    return response.json();
=======
  async login(email: string, password: string): Promise<LoginResponse> {
    return unwrapApiResponse(await authService.login({ email, password }));
>>>>>>> origin/feature/ready
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

<<<<<<< HEAD
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/auth/me`, {

      headers: {
        Authorization: `Bearer ${token}`
      }

    });

    if (!response.ok) {
      throw new Error('Non authentifié');
    }

    return response.json();
  },
  async getUsers() {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/users`, {
      headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Impossible de charger les utilisateurs");
  }
  return response.json();
}


};
=======
export * from "./auth";
export * from "./http";
export * from "./users";
>>>>>>> origin/feature/ready
