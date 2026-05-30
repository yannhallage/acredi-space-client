// import { authService, normalizeAuthUser, unwrapApiResponse } from "./auth";
// import type { AuthResponse, LoginResponse } from "./auth";
// import type { User } from "../types";

// export const api = {
//   async getNotes(q = "", archived = false) {
//   const token = localStorage.getItem("accessToken");

//   const params = new URLSearchParams();
//   params.set("archived", String(archived));
//   if (q) params.set("q", q);

//   const response = await fetch(`${API_URL}/notes?${params.toString()}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Impossible de charger les notes");
//   }

//   const result = await response.json();
//   return result.data;
// },

// async createNote(payload: {
//   title: string;
//   content: string;
//   visibility?: "PRIVATE" | "TEAM" | "PUBLIC";
//   color?: string;
// }) {
//   const token = localStorage.getItem("accessToken");

//   const response = await fetch(`${API_URL}/notes`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     throw new Error("Impossible de créer la note");
//   }

//   const result = await response.json();
//   return result.data;
// },

// async deleteNote(id: string) {
//   const token = localStorage.getItem("accessToken");

//   const response = await fetch(`${API_URL}/notes/${id}`, {
//     method: "DELETE",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Impossible de supprimer la note");
//   }

//   return true;
// },
// };

// export * from "./auth";
// export * from "./http";
// export * from "./users";


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

export type ApiResponse<TData> = {
  success: boolean;
  message: string;
  data: TData;
  timestamp?: string;
};

export * from "./auth";
export * from "./http";
// NOTE: `users` and `auth` both export a type named `ApiResponse`.
// Exporting both via `export *` causes a duplicate symbol error.
// If `users` exports are needed here, re-export them explicitly without duplicating `ApiResponse`.
